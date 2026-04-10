package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.Session;
import java.time.LocalDateTime;

/**
 * 세션 생성 유스케이스
 * v6: price 제거, regionSido/regionSigungu/recruitStartDate/recruitEndDate 추가
 */
public interface CreateSessionUseCase {
    Session createSession(CreateSessionCommand command);
    Session createDefaultSession(Event event);

    record CreateSessionCommand(
        Long eventId,
        Long requesterId,
        String title,
        String description,
        int sortOrder,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        String regionSido,
        String regionSigungu,
        boolean isOnline,
        String onlineLink,
        int maxAttendees,
        LocalDateTime recruitStartDate,
        LocalDateTime recruitEndDate
    ) {}
}
