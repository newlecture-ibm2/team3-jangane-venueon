package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;

/**
 * 이벤트 상세 조회 유스케이스 (Port-In)
 */
public interface GetEventDetailUseCase {

    Event getEventById(Long eventId);
}
