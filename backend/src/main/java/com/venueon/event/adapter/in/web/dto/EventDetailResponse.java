package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.Session;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 이벤트 상세 응답 DTO (Host 정보 + 세션 + Computed 상태 포함)
 * v6: 세션/티켓 기반 응답으로 재구성 - price/location 등 제거, Computed 필드 추가
 */
public record EventDetailResponse(
        Long id,
        String title,
        String description,
        String thumbnailUrl,
        com.venueon.common.dto.CodeDto type,
        com.venueon.common.dto.CodeDto status,
        com.venueon.common.dto.CodeDto recruitmentStatus,
        Long categoryId,
        Long creatorId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean hasSession,
        LocalDateTime startDate,
        LocalDateTime endDate,
        HostInfoDto host,
        List<SessionResponse> sessions
) {
    /**
     * Host 정보가 없는 경우 (fallback)
     */
    public static EventDetailResponse from(Event event) {
        return from(event, null, null);
    }

    /**
     * Host 정보만 있는 경우 (sessions 없음)
     */
    public static EventDetailResponse from(Event event, HostInfo hostInfo) {
        return from(event, hostInfo, null);
    }

    /**
     * Host 정보 및 Sessions 포함한 생성
     */
    public static EventDetailResponse from(Event event, HostInfo hostInfo, List<SessionResponse> sessions) {
        HostInfoDto hostDto = null;
        if (hostInfo != null) {
            hostDto = new HostInfoDto(
                    hostInfo.userId(),
                    hostInfo.nickname(),
                    hostInfo.profileImg(),
                    hostInfo.orgName(),
                    hostInfo.orgDescription()
            );
        }

        // 세션 기반 Computed 값
        List<Session> domainSessions = null; // detail에서는 SessionResponse만 사용
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        com.venueon.common.model.DomainCode effectiveStatus = event.getStatus();
        com.venueon.common.model.DomainCode recruitmentStatus = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");

        // sessions가 있으면 startDate/endDate 도출 (SessionResponse에서 추출)
        if (sessions != null && !sessions.isEmpty()) {
            startDate = sessions.stream()
                    .map(SessionResponse::startTime)
                    .filter(t -> t != null)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);
            endDate = sessions.stream()
                    .map(SessionResponse::endTime)
                    .filter(t -> t != null)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            // 모집 상태 OR 종합 (DomainCode 사용)
            boolean anyOpen = sessions.stream()
                    .anyMatch(s -> s.recruitmentStatus() != null && s.recruitmentStatus().id().equals(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_OPEN_ID));
            if (anyOpen) {
                recruitmentStatus = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_OPEN_ID, "모집중");
            } else {
                boolean allPending = sessions.stream()
                        .allMatch(s -> s.recruitmentStatus() != null && s.recruitmentStatus().id().equals(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_PENDING_ID));
                recruitmentStatus = allPending ? com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_PENDING_ID, "모집예정") : com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");
            }

            // Effective status (ONGOING check)
            if (effectiveStatus != null && effectiveStatus.id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID)) {
                boolean anyOngoing = sessions.stream()
                        .anyMatch(s -> s.sessionStatus() != null && s.sessionStatus().id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID));
                if (anyOngoing) effectiveStatus = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID, "진행중");
                boolean allEnded = sessions.stream()
                        .allMatch(s -> s.sessionStatus() != null && s.sessionStatus().id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID));
                if (allEnded) effectiveStatus = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID, "종료됨");
            }
        }

        return new EventDetailResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getThumbnailUrl(),
                event.getType() != null ? com.venueon.common.dto.CodeDto.of(event.getType().id(), event.getType().label()) : null,
                effectiveStatus != null ? com.venueon.common.dto.CodeDto.of(effectiveStatus.id(), effectiveStatus.label()) : null,
                recruitmentStatus != null ? com.venueon.common.dto.CodeDto.of(recruitmentStatus.id(), recruitmentStatus.label()) : null,
                event.getCategoryId(),
                event.getCreatorId(),
                event.getCreatedAt(),
                event.getUpdatedAt(),
                event.getHasSession(),
                startDate,
                endDate,
                hostDto,
                sessions == null ? List.of() : sessions
        );
    }

    /**
     * 주최자 정보 내장 DTO
     */
    public record HostInfoDto(
            Long userId,
            String nickname,
            String profileImg,
            String orgName,
            String orgDescription
    ) {}
}
