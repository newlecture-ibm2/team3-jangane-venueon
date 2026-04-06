package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;

import java.time.LocalDateTime;

/**
 * 이벤트 상세 응답 DTO
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
        LocalDateTime updatedAt
) {
    public static EventDetailResponse from(Event event) {
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
                event.getUpdatedAt()
        );
    }
}
