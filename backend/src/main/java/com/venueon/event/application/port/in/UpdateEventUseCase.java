package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventType;

/**
 * 이벤트 수정 유스케이스
 * v6: price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거
 */
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
            String thumbnailUrl,
            boolean hasSession
    ) {
    }
}
