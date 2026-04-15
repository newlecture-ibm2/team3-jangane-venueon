package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;

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
            String detailContent,
            Long typeId,
            String thumbnailUrl,
            boolean hasSession
    ) {
    }
}
