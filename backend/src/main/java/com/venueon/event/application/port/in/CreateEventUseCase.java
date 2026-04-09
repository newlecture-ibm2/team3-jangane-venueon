package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventType;
import com.venueon.event.domain.model.PurchaseType;
import com.venueon.event.adapter.in.web.dto.SessionCreateRequest;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 이벤트 생성 유스케이스 (Port-In)
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
            EventType type,
            String location,
            boolean isOnline,
            int price,
            int maxAttendees,
            String thumbnailUrl,
            LocalDateTime startDate,
            LocalDateTime endDate,
            boolean hasSession,
            PurchaseType purchaseType,
            List<SessionCreateRequest> sessions
    ) {}
}
