package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventType;
import java.time.LocalDateTime;

public interface UpdateEventUseCase {
    Event updateEvent(UpdateEventCommand command);

    record UpdateEventCommand(
            Long eventId,
            Long requesterId,
            String requesterRole,
            Long categoryId,
            String title,
            String description,
            EventType type,
            String location,
            boolean isOnline,
            int price,
            int maxAttendees,
            String thumbnailUrl,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
    }
}
