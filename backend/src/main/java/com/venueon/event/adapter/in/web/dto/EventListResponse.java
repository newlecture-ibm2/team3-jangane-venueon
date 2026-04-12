package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import com.venueon.event.domain.model.RecruitmentStatus;
import com.venueon.event.domain.model.Session;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 이벤트 목록 응답 DTO
 * v7: recruitmentStatus, startDate, endDate 추가 (세션 기반 벌크 계산)
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
        LocalDateTime endDate                  // 세션 최대 종료일
) {
    /**
     * 세션 정보 없이 생성 (fallback)
     */
    public static EventListResponse from(Event event) {
        return from(event, List.of());
    }

    /**
     * 세션 목록을 받아 startDate/endDate/recruitmentStatus 계산
     */
    public static EventListResponse from(Event event, List<Session> sessions) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        EventStatus effectiveStatus = event.getStatus();
        RecruitmentStatus recruitmentStatus = RecruitmentStatus.CLOSED;

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
                endDate
        );
    }
}

