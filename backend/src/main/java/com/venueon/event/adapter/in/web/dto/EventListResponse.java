package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import com.venueon.event.domain.model.RecruitmentStatus;
import com.venueon.event.domain.model.Session;
import com.venueon.ticket.domain.model.Ticket;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 이벤트 목록 응답 DTO
 * v8: 티켓 기반 가격 정보 + 대표 장소 + 온라인 여부 추가
 */
public record EventListResponse(
        Long id,
        String title,
        String thumbnailUrl,
        EventType type,
        EventStatus status,
        RecruitmentStatus recruitmentStatus,   // 모집상태 (세션 종합)
        Long categoryId,
        Long creatorId,
        LocalDateTime createdAt,
        boolean hasSession,
        LocalDateTime startDate,               // 세션 최소 시작일
        LocalDateTime endDate,                 // 세션 최대 종료일
        Integer minPrice,                      // 활성 티켓 최저 판매가 (null=티켓없음)
        Integer maxPrice,                      // 활성 티켓 최고 판매가
        boolean hasDiscount,                   // 할인 티켓 존재 여부
        Integer originalPrice,                 // 최저가 티켓의 원래 가격 (할인 시)
        String primaryLocation,                // 대표 세션 장소
        boolean isOnline                       // 전체 세션이 온라인인지
) {
    /**
     * 세션 정보 없이 생성 (fallback)
     */
    public static EventListResponse from(Event event) {
        return from(event, List.of(), List.of());
    }

    /**
     * 세션만 있는 경우 (하위 호환)
     */
    public static EventListResponse from(Event event, List<Session> sessions) {
        return from(event, sessions, List.of());
    }

    /**
     * 세션 + 티켓 정보를 받아 전체 Computed 필드 계산
     */
    public static EventListResponse from(Event event, List<Session> sessions, List<Ticket> tickets) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        EventStatus effectiveStatus = event.getStatus();
        RecruitmentStatus recruitmentStatus = RecruitmentStatus.CLOSED;
        String primaryLocation = null;
        boolean isOnline = false;

        if (sessions != null && !sessions.isEmpty()) {
            startDate = sessions.stream()
                    .map(Session::getStartTime)
                    .filter(t -> t != null)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);
            endDate = sessions.stream()
                    .map(Session::getEndTime)
                    .filter(t -> t != null)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            // 모집 상태 OR 종합
            boolean anyOpen = sessions.stream()
                    .anyMatch(s -> s.getRecruitmentStatus() == RecruitmentStatus.OPEN);
            if (anyOpen) {
                recruitmentStatus = RecruitmentStatus.OPEN;
            } else {
                boolean allPending = sessions.stream()
                        .allMatch(s -> s.getRecruitmentStatus() == RecruitmentStatus.PENDING);
                recruitmentStatus = allPending ? RecruitmentStatus.PENDING : RecruitmentStatus.CLOSED;
            }

            // Effective status (ONGOING / ENDED)
            if (effectiveStatus == EventStatus.PUBLISHED) {
                boolean anyOngoing = sessions.stream()
                        .anyMatch(s -> s.getSessionStatus() == EventStatus.ONGOING);
                if (anyOngoing) effectiveStatus = EventStatus.ONGOING;
                boolean allEnded = sessions.stream()
                        .allMatch(s -> s.getSessionStatus() == EventStatus.ENDED);
                if (allEnded) effectiveStatus = EventStatus.ENDED;
            }

            // 대표 장소 (첫 번째 오프라인 세션 기준)
            primaryLocation = sessions.stream()
                    .filter(s -> !s.getIsOnline() && s.getLocation() != null && !s.getLocation().isBlank())
                    .map(Session::getLocation)
                    .findFirst()
                    .orElse(null);

            // 전체 온라인 여부 (모든 세션이 온라인이면 true)
            isOnline = sessions.stream().allMatch(Session::getIsOnline);
        }

        // 티켓 기반 가격 계산 (활성 티켓만)
        Integer minPrice = null;
        Integer maxPrice = null;
        boolean hasDiscount = false;
        Integer originalPrice = null;

        if (tickets != null && !tickets.isEmpty()) {
            List<Ticket> activeTickets = tickets.stream()
                    .filter(Ticket::getIsActive)
                    .toList();

            if (!activeTickets.isEmpty()) {
                Ticket minTicket = activeTickets.stream().min(java.util.Comparator.comparingInt(Ticket::getPrice)).orElse(null);
                if (minTicket != null) {
                    minPrice = minTicket.getPrice();
                    if (minTicket.getOriginalPrice() > minTicket.getPrice() && minTicket.getOriginalPrice() > 0) {
                        originalPrice = minTicket.getOriginalPrice();
                    }
                }
                maxPrice = activeTickets.stream()
                        .mapToInt(Ticket::getPrice)
                        .max()
                        .orElse(0);
                hasDiscount = activeTickets.stream()
                        .anyMatch(t -> t.getOriginalPrice() > t.getPrice() && t.getOriginalPrice() > 0);
            }
        }

        return new EventListResponse(
                event.getId(),
                event.getTitle(),
                event.getThumbnailUrl(),
                event.getType(),
                effectiveStatus,
                recruitmentStatus,
                event.getCategoryId(),
                event.getCreatorId(),
                event.getCreatedAt(),
                event.getHasSession(),
                startDate,
                endDate,
                minPrice,
                maxPrice,
                hasDiscount,
                originalPrice,
                primaryLocation,
                isOnline
        );
    }
}
