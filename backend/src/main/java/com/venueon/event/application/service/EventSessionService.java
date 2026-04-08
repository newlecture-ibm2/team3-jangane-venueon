package com.venueon.event.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.event.application.port.in.*;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventSession;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@UseCase
@RequiredArgsConstructor
@Transactional
public class EventSessionService implements 
        CreateSessionUseCase, UpdateSessionUseCase, DeleteSessionUseCase, 
        GetSessionUseCase, ReorderSessionUseCase {

    private final SessionPort sessionPort;
    private final EventRepositoryPort eventRepositoryPort;

    @Override
    public EventSession createDefaultSession(Event event) {
        EventSession session = new EventSession(
                null,
                event.getId(),
                "기본 세션",
                "이벤트 전체가 하나의 세션으로 판매됩니다.",
                0,
                event.getStartDate() != null ? event.getStartDate() : null,
                event.getEndDate() != null ? event.getEndDate() : null,
                event.getLocation() != null ? event.getLocation() : "미정",
                null, // regionSido
                null, // regionSigungu
                event.getIsOnline(),
                null, // onlineLink
                event.getPrice(),
                event.getMaxAttendees(),
                0, // currentAttendees
                true, // isDefault
                null,
                null
        );
        return sessionPort.save(session, event.getId());
    }

    @Override
    public EventSession createSession(CreateSessionCommand command) {
        Event event = getEventAndValidateOwner(command.eventId(), command.requesterId());

        if (!event.getHasSession()) {
            throw new IllegalStateException("세션 관리가 비활성화된 이벤트입니다.");
        }

        EventSession session = new EventSession(
                null,
                command.eventId(),
                command.title(),
                command.description(),
                command.sortOrder(),
                command.startTime(),
                command.endTime(),
                command.location(),
                null, // regionSido
                null, // regionSigungu
                command.isOnline(),
                command.onlineLink(),
                command.price(),
                command.maxAttendees(),
                0, // currentAttendees
                false, // isDefault
                null,
                null
        );

        return sessionPort.save(session, command.eventId());
    }

    @Override
    public EventSession updateSession(UpdateSessionCommand command) {
        getEventAndValidateOwner(command.eventId(), command.requesterId());

        EventSession session = sessionPort.findById(command.sessionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getEventId().equals(command.eventId())) {
            throw new IllegalArgumentException("세션이 해당 이벤트에 속하지 않습니다.");
        }

        session.updateDetails(
                command.title(),
                command.description(),
                command.sortOrder(),
                command.startTime(),
                command.endTime(),
                command.location(),
                null, // regionSido
                null, // regionSigungu
                command.isOnline(),
                command.onlineLink(),
                command.price(),
                command.maxAttendees()
        );

        return sessionPort.save(session, command.eventId());
    }

    @Override
    public void deleteSession(Long sessionId, Long eventId, Long requesterId) {
        getEventAndValidateOwner(eventId, requesterId);

        EventSession session = sessionPort.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getEventId().equals(eventId)) {
            throw new IllegalArgumentException("세션이 해당 이벤트에 속하지 않습니다.");
        }

        if (session.getIsDefault()) {
            throw new BusinessException(ErrorCode.SESSION_DELETE_NOT_ALLOWED);
        }

        // TODO: Step 3에서 Order 연동 시, 해당 세션에 주문이 있는지 검증 추가
        // if (orderRepositoryPort.existsBySessionId(sessionId)) { throw Error }

        sessionPort.deleteById(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSession> getSessionsByEventId(Long eventId) {
        return sessionPort.findByEventId(eventId);
    }

    @Override
    public void reorderSessions(Long eventId, Long requesterId, List<Long> sessionIds) {
        getEventAndValidateOwner(eventId, requesterId);

        List<EventSession> sessions = sessionPort.findByEventId(eventId);
        Map<Long, EventSession> sessionMap = sessions.stream()
                .collect(Collectors.toMap(EventSession::getId, Function.identity()));

        int order = 1;
        for (Long sessionId : sessionIds) {
            EventSession session = sessionMap.get(sessionId);
            if (session != null) {
                session.updateDetails(
                        session.getTitle(),
                        session.getDescription(),
                        order++,
                        session.getStartTime(),
                        session.getEndTime(),
                        session.getLocation(),
                        session.getRegionSido(),
                        session.getRegionSigungu(),
                        session.getIsOnline(),
                        session.getOnlineLink(),
                        session.getPrice(),
                        session.getMaxAttendees()
                );
                sessionPort.save(session, eventId);
            }
        }
    }

    private Event getEventAndValidateOwner(Long eventId, Long requesterId) {
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

        if (!event.isOwnedBy(requesterId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return event;
    }
}
