package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.EventSession;
import java.time.LocalDateTime;

public interface UpdateSessionUseCase {
    EventSession updateSession(UpdateSessionCommand command);

    record UpdateSessionCommand(
        Long sessionId,
        Long eventId,
        Long requesterId,
        String title,
        String description,
        int sortOrder,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        boolean isOnline,
        String onlineLink,
        int price,
        int maxAttendees
    ) {}
}
