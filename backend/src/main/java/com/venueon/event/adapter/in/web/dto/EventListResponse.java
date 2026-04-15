package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Event;
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
        com.venueon.common.dto.CodeDto type,
        com.venueon.common.dto.CodeDto status,
        com.venueon.common.dto.CodeDto recruitmentStatus,   // 모집상태 (세션 종합)
        Long categoryId,
        Long creatorId,
        String creatorName,
        LocalDateTime createdAt,
        boolean hasSession,
        LocalDateTime startDate,               // 세션 최소 시작일
        LocalDateTime endDate,                 // 세션 최대 종료일
        Integer minPrice,                      // 활성 티켓 최저 판매가 (null=티켓없음)
        Integer maxPrice,                      // 활성 티켓 최고 판매가
        boolean hasDiscount,                   // 할인 티켓 존재 여부
        Integer originalPrice,                 // 최저가 티켓의 원래 가격 (할인 시)
        String primaryLocation,                // 대표 세션 장소
        boolean isOnline,                      // 전체 세션이 온라인인지
        LocalDateTime recruitStartDate,        // 세션들 중 가장 빠른 모집 시작일
        LocalDateTime recruitEndDate           // 세션들 중 가장 늦은 모집 마감일
) {
    /**
     * 세션 정보 없이 생성 (fallback)
     */
    public static EventListResponse from(Event event, String creatorName) {
        return from(event, List.of(), List.of(), creatorName);
    }

    /**
     * 세션만 있는 경우 (하위 호환)
     */
    public static EventListResponse from(Event event, List<Session> sessions, String creatorName) {
        return from(event, sessions, List.of(), creatorName);
    }

    /**
     * 세션 + 티켓 정보를 받아 전체 Computed 필드 계산
     */
    public static EventListResponse from(Event event, List<Session> sessions, List<Ticket> tickets, String creatorName) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        com.venueon.common.model.DomainCode effectiveStatus = event.getStatus();
        com.venueon.common.model.DomainCode recruitmentStatus = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");
        String primaryLocation = null;
        boolean isOnline = false;
        LocalDateTime recruitStartDate = null;
        LocalDateTime recruitEndDate = null;

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
            recruitmentStatus = event.getRecruitmentStatus(sessions);

            // Effective status (ONGOING / ENDED)
            effectiveStatus = event.getEffectiveStatus(sessions);

            // 대표 장소 (첫 번째 오프라인 세션 기준)
            primaryLocation = sessions.stream()
                    .filter(s -> !s.getIsOnline() && s.getLocation() != null && !s.getLocation().isBlank())
                    .map(Session::getLocation)
                    .findFirst()
                    .orElse(null);

            // 전체 온라인 여부 (모든 세션이 온라인이면 true)
            isOnline = sessions.stream().allMatch(Session::getIsOnline);

            // 모집 시작일/마감일 (세션 종합)
            recruitStartDate = sessions.stream()
                    .map(Session::getRecruitStartDate)
                    .filter(t -> t != null)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);
            recruitEndDate = sessions.stream()
                    .map(Session::getRecruitEndDate)
                    .filter(t -> t != null)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
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
                event.getType() != null ? com.venueon.common.dto.CodeDto.of(event.getType().id(), event.getType().label()) : null,
                effectiveStatus != null ? com.venueon.common.dto.CodeDto.of(effectiveStatus.id(), effectiveStatus.label()) : null,
                recruitmentStatus != null ? com.venueon.common.dto.CodeDto.of(recruitmentStatus.id(), recruitmentStatus.label()) : null,
                event.getCategoryId(),
                event.getCreatorId(),
                creatorName,
                event.getCreatedAt(),
                event.getHasSession(),
                startDate,
                endDate,
                minPrice,
                maxPrice,
                hasDiscount,
                originalPrice,
                primaryLocation,
                isOnline,
                recruitStartDate,
                recruitEndDate
        );
    }
}
