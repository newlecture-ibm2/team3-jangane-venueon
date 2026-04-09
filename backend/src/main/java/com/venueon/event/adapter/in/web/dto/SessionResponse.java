package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.EventSession;
import java.time.LocalDateTime;

public record SessionResponse(
    Long id,
    Long eventId,
    String title,
    String description,
    int sortOrder,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    boolean isOnline,
    String onlineLink,
    int price,
    int maxAttendees,
    int currentAttendees,
    boolean isDefault
) {
    public static SessionResponse from(EventSession session) {
        return new SessionResponse(
            session.getId(),
            session.getEventId(),
            session.getTitle(),
            session.getDescription(),
            session.getSortOrder(),
            session.getStartTime(),
            session.getEndTime(),
            session.getLocation(),
            session.getIsOnline(),
            session.getOnlineLink(),
            session.getPrice(),
            session.getMaxAttendees(),
            session.getCurrentAttendees(),
            session.getIsDefault()
        );
    }
}
