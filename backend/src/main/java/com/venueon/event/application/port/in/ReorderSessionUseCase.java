package com.venueon.event.application.port.in;

import java.util.List;

public interface ReorderSessionUseCase {
    void reorderSessions(Long eventId, Long requesterId, List<Long> sessionIds);
}
