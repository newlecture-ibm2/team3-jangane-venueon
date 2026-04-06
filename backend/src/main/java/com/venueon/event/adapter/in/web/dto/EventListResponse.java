package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;

import java.time.LocalDateTime;

/**
 * 이벤트 목록 응답 DTO
 */
public record EventListResponse(
        Long id,
        String title,
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
        LocalDateTime createdAt
) {
    public static EventListResponse from(Event event) {
        return new EventListResponse(
                event.getId(),
                event.getTitle(),
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
                event.getCreatedAt()
        );
    }
}
