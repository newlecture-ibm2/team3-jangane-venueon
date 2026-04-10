package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;

import java.time.LocalDateTime;

/**
 * 이벤트 목록 응답 DTO
 * v6: price/location/purchaseType 제거, 세션 기반 Computed 필드는 향후 추가
 */
public record EventListResponse(
        Long id,
        String title,
        String thumbnailUrl,
        EventType type,
        EventStatus status,
        Long categoryId,
        Long creatorId,
        LocalDateTime createdAt,
        boolean hasSession
) {
    public static EventListResponse from(Event event) {
        return new EventListResponse(
                event.getId(),
                event.getTitle(),
                event.getThumbnailUrl(),
                event.getType(),
                event.getStatus(),
                event.getCategoryId(),
                event.getCreatorId(),
                event.getCreatedAt(),
                event.getHasSession()
        );
    }
}
