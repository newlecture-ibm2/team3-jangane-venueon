package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import com.venueon.event.domain.model.PurchaseType;

import java.time.LocalDateTime;

import java.util.List;

/**
 * 이벤트 상세 응답 DTO (Host 정보 포함)
 */
public record EventDetailResponse(
        Long id,
        String title,
        String description,
        String thumbnailUrl,
        EventType type,
        EventStatus status,
        String location,
        boolean isOnline,
        int price,
        int maxAttendees,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Long categoryId,
        Long creatorId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean hasSession,
        PurchaseType purchaseType,
        HostInfoDto host,
        List<SessionResponse> sessions
) {
    /**
     * Host 정보가 없는 경우 (fallback)
     */
    public static EventDetailResponse from(Event event) {
        return from(event, null);
    }

    /**
     * Host 정보만 있는 경우 (sessions 없음, 과거 하위 호환)
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

        return new EventDetailResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getThumbnailUrl(),
                event.getType(),
                event.getStatus(),
                event.getLocation(),
                event.getIsOnline(),
                event.getPrice(),
                event.getMaxAttendees(),
                event.getStartDate(),
                event.getEndDate(),
                event.getCategoryId(),
                event.getCreatorId(),
                event.getCreatedAt(),
                event.getUpdatedAt(),
                event.getHasSession(),
                event.getPurchaseType(),
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
