package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.adapter.in.web.dto.SessionCreateRequest;

import java.util.List;

/**
 * 이벤트 생성 유스케이스 (Port-In)
 * v6: price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거
 */
public interface CreateEventUseCase {

    Event createEvent(CreateEventCommand command);

    /**
     * 이벤트 생성 요청 커맨드
     */
    record CreateEventCommand(
            Long creatorId,
            Long categoryId,
            String title,
            String description,
            String detailContent,
            Long typeId,
            String thumbnailUrl,
            boolean hasSession,
            List<SessionCreateRequest> sessions
    ) {}
}
