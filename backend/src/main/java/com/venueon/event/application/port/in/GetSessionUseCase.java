package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Session;
import java.util.List;

/**
 * 세션 조회 유스케이스
 * v6: EventSession → Session 리네이밍
 */
public interface GetSessionUseCase {
    List<Session> getSessionsByEventId(Long eventId);
}
