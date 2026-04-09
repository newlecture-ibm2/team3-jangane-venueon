package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.EventSession;
import java.util.List;

public interface GetSessionUseCase {
    List<EventSession> getSessionsByEventId(Long eventId);
}
