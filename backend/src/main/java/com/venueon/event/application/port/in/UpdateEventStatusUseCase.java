package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;

/**
 * 이벤트 상태 변경 유스케이스 (Port-In)
 */
public interface UpdateEventStatusUseCase {

    Event updateStatus(Long eventId, Long requesterId, String requesterRole, EventStatus newStatus);
}
