package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Session;
import java.util.List;

/**
 * 세션 조회 유스케이스
 * v6: EventSession → Session 리네이밍
 */
public interface GetSessionUseCase {
    List<Session> getSessionsByEventId(Long eventId);

    /**
     * 여러 이벤트 ID로 세션 벌크 조회 (N+1 방지)
     */
    List<Session> getSessionsByEventIds(List<Long> eventIds);
}
