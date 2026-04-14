package com.venueon.badge.adapter.in.web;

import com.venueon.badge.adapter.in.web.dto.response.BadgeDetailResponse;
import com.venueon.badge.adapter.in.web.dto.response.BadgeListResponse;
import com.venueon.badge.application.port.in.GetMyBadgesUseCase;
import com.venueon.badge.domain.model.Badge;
import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionJpaEntity;
import com.venueon.ticket.adapter.out.persistence.repository.TicketSessionJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

/**
 * 뱃지 조회 API Controller
 * GET /badges/me       — 내 뱃지 목록
 * GET /badges/me/{id}  — 뱃지 상세 (세션 정보 포함)
 */
@Slf4j
@RestController
@RequestMapping("/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final GetMyBadgesUseCase getMyBadgesUseCase;
    private final EventJpaRepository eventJpaRepository;
    private final SessionJpaRepository sessionJpaRepository;
    private final OrderJpaRepository orderJpaRepository;
    private final TicketSessionJpaRepository ticketSessionJpaRepository;

    @GetMapping("/me")
    @Transactional
    public ResponseEntity<?> getMyBadges(@RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        Long userId = resolveUserId(headerUserId);

        List<Badge> badges = getMyBadgesUseCase.getMyBadges(userId);

        // 이벤트 정보 벌크 조회 (N+1 방지)
        List<Long> eventIds = badges.stream()
                .map(Badge::getEventId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, EventJpaEntity> eventMap = eventIds.isEmpty()
                ? Collections.emptyMap()
                : eventJpaRepository.findAllById(eventIds).stream()
                        .collect(Collectors.toMap(EventJpaEntity::getId, e -> e));

        List<BadgeListResponse> response = badges.stream()
                .map(badge -> {
                    EventJpaEntity event = badge.getEventId() != null ? eventMap.get(badge.getEventId()) : null;

                    String category = null;
                    String creatorNickname = null;
                    String creatorProfileImg = null;

                    if (event != null) {
                        CategoryJpaEntity cat = event.getCategory();
                        if (cat != null) category = cat.getName();

                        UserJpaEntity creator = event.getCreator();
                        if (creator != null) {
                            creatorNickname = creator.getNickname();
                            creatorProfileImg = creator.getProfileImg();
                        }
                    }

                    return new BadgeListResponse(
                            badge.getId(),
                            badge.getBadgeName(),
                            badge.getBadgeImageUrl(),
                            category,
                            creatorNickname,
                            creatorProfileImg,
                            badge.getEarnedAt(),
                            badge.getEventId(),
                            badge.isVisible()
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", response));
    }

    @GetMapping("/me/{badgeId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyBadgeDetail(
            @PathVariable Long badgeId,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {

        Long userId = resolveUserId(headerUserId);

        Badge badge = getMyBadgesUseCase.getMyBadgeDetail(userId, badgeId)
                .orElse(null);

        if (badge == null) {
            return ResponseEntity.notFound().build();
        }

        EventJpaEntity event = badge.getEventId() != null
                ? eventJpaRepository.findById(badge.getEventId()).orElse(null)
                : null;

        String category = null;
        String creatorNickname = null;
        String creatorProfileImg = null;
        List<BadgeDetailResponse.SessionInfo> sessionInfos = new ArrayList<>();

        if (event != null) {
            CategoryJpaEntity cat = event.getCategory();
            if (cat != null) category = cat.getName();

            UserJpaEntity creator = event.getCreator();
            if (creator != null) {
                creatorNickname = creator.getNickname();
                creatorProfileImg = creator.getProfileImg();
            }

            // 사용자가 구매한 티켓의 세션 정보 조회
            List<OrderJpaEntity> userOrders = orderJpaRepository.findByUserIdAndEventIdAndStatusIn(
                    userId, event.getId(), List.of(OrderStatus.PAID, OrderStatus.REGISTERED));

            Set<Long> ticketIds = userOrders.stream()
                    .filter(o -> o.getTicket() != null)
                    .map(o -> o.getTicket().getId())
                    .collect(Collectors.toSet());

            // 티켓에 연결된 세션 ID 수집
            Set<Long> sessionIds = new HashSet<>();
            boolean hasAllSessions = false;

            for (OrderJpaEntity order : userOrders) {
                if (order.getTicket() != null && order.getTicket().isAllSessions()) {
                    hasAllSessions = true;
                    break;
                }
            }

            List<SessionJpaEntity> sessions;
            if (hasAllSessions) {
                // 전체 세션 포함 티켓 → 이벤트의 모든 세션
                sessions = sessionJpaRepository.findByEventIdOrderBySortOrder(event.getId());
            } else {
                // 개별 세션 티켓 → 연결된 세션만
                for (Long ticketId : ticketIds) {
                    List<TicketSessionJpaEntity> ticketSessions = ticketSessionJpaRepository.findByTicketId(ticketId);
                    ticketSessions.forEach(ts -> sessionIds.add(ts.getSession().getId()));
                }
                sessions = sessionIds.isEmpty()
                        ? sessionJpaRepository.findByEventIdOrderBySortOrder(event.getId())
                        : sessionJpaRepository.findAllByIds(new ArrayList<>(sessionIds));
            }

            sessionInfos = sessions.stream()
                    .map(s -> new BadgeDetailResponse.SessionInfo(
                            s.getTitle(),
                            s.getStartTime(),
                            s.getEndTime(),
                            s.isOnline(),
                            s.getLocation()
                    ))
                    .collect(Collectors.toList());
        }

        BadgeDetailResponse response = new BadgeDetailResponse(
                badge.getId(),
                badge.getBadgeName(),
                badge.getBadgeImageUrl(),
                category,
                creatorNickname,
                creatorProfileImg,
                badge.getEarnedAt(),
                badge.getEventId(),
                badge.isVisible(),
                sessionInfos
        );

        return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", response));
    }

    private Long resolveUserId(Long headerUserId) {
        // BFF에서 X-User-Id 헤더로 전달 또는 SecurityContext에서 추출
        // 개발 단계에서는 헤더 우선, 없으면 기본값
        return headerUserId != null ? headerUserId : 2L;
    }
}
