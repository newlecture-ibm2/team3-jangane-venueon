package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Session;
import java.time.LocalDateTime;

/**
 * 세션 수정 유스케이스
 * v6: price 제거, regionSido/regionSigungu/recruitStartDate/recruitEndDate 추가
 */
public interface UpdateSessionUseCase {
    Session updateSession(UpdateSessionCommand command);

    record UpdateSessionCommand(
        Long sessionId,
        Long eventId,
        Long requesterId,
        String requesterRole,
        String title,
        String description,
        int sortOrder,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        String regionSido,
        String regionSigungu,
        String addressRoad,
        String addressDetail,
        boolean isOnline,
        String onlineLink,
        int maxAttendees,
        LocalDateTime recruitStartDate,
        LocalDateTime recruitEndDate
    ) {}
}
