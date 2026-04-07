package com.venueon.event.application.port.in;

public interface DeleteEventUseCase {
    void deleteEvent(Long eventId, Long requesterId, String requesterRole);
}
