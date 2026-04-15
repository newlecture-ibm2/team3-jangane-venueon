package com.venueon.badge.application.service;

import com.venueon.badge.application.port.in.IssueBadgesUseCase;
import com.venueon.badge.application.port.out.BadgeRepositoryPort;
import com.venueon.badge.domain.model.Badge;
import com.venueon.common.annotation.UseCase;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionJpaEntity;
import com.venueon.ticket.adapter.out.persistence.repository.TicketSessionJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 뱃지 발급 서비스 (Lazy Issuance)
 * 사용자가 뱃지 조회 시 미발급 뱃지를 그 자리에서 발급
 *
 * 발급 조건: 사용자가 구매한 티켓에 포함된 세션이 모두 종료되면 발급
 * - 세션 종료 판정: endTime < now (자동) 또는 forcedSessionStatus = "Ended" (수동)
 * - 취소된 세션(forcedSessionStatus = "Cancelled")은 발급 대상에서 제외
 * - isAllSessions=true 티켓: 해당 이벤트의 전체 세션이 종료되어야 함
 * - isAllSessions=false 티켓: ticket_sessions에 매핑된 세션만 종료되면 됨
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class BadgeIssueService implements IssueBadgesUseCase {

    private final BadgeRepositoryPort badgeRepositoryPort;
    private final OrderJpaRepository orderJpaRepository;
    private final EventJpaRepository eventJpaRepository;
    private final SessionJpaRepository sessionJpaRepository;
    private final TicketSessionJpaRepository ticketSessionJpaRepository;

    @Override
    @Transactional
    public int issueNewBadgesForUser(Long userId) {
        // 1. 사용자의 유효 주문(PAID, REGISTERED) 조회
        List<OrderJpaEntity> validOrders = orderJpaRepository.findByUserIdAndStatusIn(
                userId, List.of(OrderStatus.PAID, OrderStatus.REGISTERED));

        if (validOrders.isEmpty()) {
            return 0;
        }

        // 2. 이미 뱃지가 발급된 이벤트 ID 목록
        List<Long> allEventIds = validOrders.stream()
                .map(o -> o.getEvent().getId())
                .distinct()
                .collect(Collectors.toList());

        Set<Long> alreadyIssuedEventIds = badgeRepositoryPort
                .findByUserIdAndEventIdIn(userId, allEventIds)
                .stream()
                .map(Badge::getEventId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 3. 미발급 주문만 필터
        List<OrderJpaEntity> candidateOrders = validOrders.stream()
                .filter(o -> !alreadyIssuedEventIds.contains(o.getEvent().getId()))
                .collect(Collectors.toList());

        if (candidateOrders.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        int issuedCount = 0;

        // 4. 주문별로 티켓의 세션 종료 여부 판별
        // 같은 이벤트에 대해 중복 발급 방지를 위해 발급된 이벤트 ID 추적
        Set<Long> issuedInThisRun = new HashSet<>();

        for (OrderJpaEntity order : candidateOrders) {
            Long eventId = order.getEvent().getId();

            // 이번 실행에서 이미 발급한 이벤트는 스킵
            if (issuedInThisRun.contains(eventId)) {
                continue;
            }

            TicketJpaEntity ticket = order.getTicket();

            // 티켓에 포함된 세션 목록 결정
            List<SessionJpaEntity> targetSessions;
            if (ticket == null || ticket.isAllSessions()) {
                // 전체 세션 대상 (티켓이 없는 구 데이터 포함)
                targetSessions = sessionJpaRepository.findByEventIdOrderBySortOrder(eventId);
            } else {
                // ticket_sessions 매핑된 세션만 대상
                List<TicketSessionJpaEntity> ticketSessions = ticketSessionJpaRepository.findByTicketId(ticket.getId());
                targetSessions = ticketSessions.stream()
                        .map(TicketSessionJpaEntity::getSession)
                        .collect(Collectors.toList());
            }

            // 세션이 없으면 (데이터 오류 등) 이벤트 전체 세션으로 롤백해서 평가
            if (targetSessions.isEmpty()) {
                targetSessions = sessionJpaRepository.findByEventIdOrderBySortOrder(eventId);
                if (targetSessions.isEmpty()) {
                    continue;
                }
            }

            // 취소된 세션은 뱃지 발급 대상에서 제외
            Long CANCELLED_STATUS_ID = 5L;
            targetSessions = targetSessions.stream()
                    .filter(s -> {
                        if (s.getForcedSessionStatus() != null && s.getForcedSessionStatus().getId().equals(CANCELLED_STATUS_ID)) {
                            return false; // 취소된 세션 제외
                        }
                        return true;
                    })
                    .collect(Collectors.toList());

            if (targetSessions.isEmpty()) {
                continue; // 모든 세션이 취소된 경우 뱃지 미발급
            }

            // 모든 대상 세션이 종료되었는지 확인 (자동 + 수동 종료 모두 고려)
            boolean allSessionsEnded = targetSessions.stream()
                    .allMatch(s -> isSessionEnded(s, now));

            if (allSessionsEnded) {
                // 뱃지 취득일 = 마지막 세션 종료 시각
                LocalDateTime earnedAt = targetSessions.stream()
                        .map(SessionJpaEntity::getEndTime)
                        .max(LocalDateTime::compareTo)
                        .orElse(now);

                EventJpaEntity event = eventJpaRepository.findById(eventId).orElse(null);
                if (event == null) continue;

                Badge badge = Badge.create(
                        userId,
                        eventId,
                        event.getTitle(),
                        event.getThumbnailUrl(),
                        earnedAt
                );

                badgeRepositoryPort.save(badge);
                issuedInThisRun.add(eventId);
                issuedCount++;
                log.debug("뱃지 발급: userId={}, eventId={}, badgeName={}", userId, eventId, event.getTitle());
            }
        }

        if (issuedCount > 0) {
            log.info("뱃지 Lazy Issuance 완료: userId={}, 발급 수={}", userId, issuedCount);
        }

        return issuedCount;
    }

    /**
     * 세션이 종료되었는지 판별
     * - 자동 종료: endTime이 존재하고 현재 시각보다 이전
     * - 수동 종료: forcedSessionStatus의 ID가 4(Ended)인 경우
     */
    private boolean isSessionEnded(SessionJpaEntity session, LocalDateTime now) {
        // 1) 자동 종료: endTime 기반
        if (session.getEndTime() != null && session.getEndTime().isBefore(now)) {
            return true;
        }
        // 2) 수동 종료: forcedSessionStatus = Ended (ID=4)
        Long ENDED_STATUS_ID = 4L;
        if (session.getForcedSessionStatus() != null
                && session.getForcedSessionStatus().getId().equals(ENDED_STATUS_ID)) {
            return true;
        }
        return false;
    }
}
