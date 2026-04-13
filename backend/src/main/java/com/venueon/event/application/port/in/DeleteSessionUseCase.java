package com.venueon.event.application.port.in;

public interface DeleteSessionUseCase {
    void deleteSession(Long sessionId, Long eventId, Long requesterId, String requesterRole);
}
