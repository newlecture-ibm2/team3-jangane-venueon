package com.venueon.event.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.event.application.port.in.*;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 세션 CRUD 서비스
 * v6: EventSession → Session, price 제거, 모집 필드 추가
 */
@UseCase
@RequiredArgsConstructor
@Transactional
public class EventSessionService implements
        CreateSessionUseCase, UpdateSessionUseCase, DeleteSessionUseCase,
        GetSessionUseCase, ReorderSessionUseCase {

    private final SessionPort sessionPort;
    private final EventRepositoryPort eventRepositoryPort;

    @Override
    public Session createDefaultSession(Event event) {
        Session session = new Session(
                null,
                event.getId(),
                "기본 세션",
                "이벤트 전체가 하나의 세션으로 운영됩니다.",
                0,
                null,      // startTime — DRAFT이므로 null 허용
                null,      // endTime
                null,      // location
                null,      // regionSido
                null,      // regionSigungu
                false,     // isOnline
                null,      // onlineLink
                0,         // maxAttendees (0=무제한)
                0,         // currentAttendees
                null,      // recruitStartDate
                null,      // recruitEndDate
                false,     // isRecruitmentClosed
                true,      // isDefault
                null,
                null
        );
        return sessionPort.save(session, event.getId());
    }

    @Override
    public Session createSession(CreateSessionCommand command) {
        Event event = getEventAndValidateOwner(command.eventId(), command.requesterId());

        if (!event.getHasSession()) {
            throw new IllegalStateException("세션 관리가 비활성화된 이벤트입니다.");
        }

        Session session = new Session(
                null,
                command.eventId(),
                command.title(),
                command.description(),
                command.sortOrder(),
                command.startTime(),
                command.endTime(),
                command.location(),
                command.regionSido(),
                command.regionSigungu(),
                command.isOnline(),
                command.onlineLink(),
                command.maxAttendees(),
                0, // currentAttendees
                command.recruitStartDate(),
                command.recruitEndDate(),
                false, // isRecruitmentClosed
                false, // isDefault
                null,
                null
        );

        return sessionPort.save(session, command.eventId());
    }

    @Override
    public Session updateSession(UpdateSessionCommand command) {
        getEventAndValidateOwner(command.eventId(), command.requesterId());

        Session session = sessionPort.findById(command.sessionId())
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
                command.regionSido(),
                command.regionSigungu(),
                command.isOnline(),
                command.onlineLink(),
                command.maxAttendees(),
                command.recruitStartDate(),
                command.recruitEndDate()
        );

        return sessionPort.save(session, command.eventId());
    }

    @Override
    public void deleteSession(Long sessionId, Long eventId, Long requesterId) {
        getEventAndValidateOwner(eventId, requesterId);

        Session session = sessionPort.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getEventId().equals(eventId)) {
            throw new IllegalArgumentException("세션이 해당 이벤트에 속하지 않습니다.");
        }

        if (session.getIsDefault()) {
            throw new BusinessException(ErrorCode.SESSION_DELETE_NOT_ALLOWED);
        }

        // TODO: Phase 3 이후 Order/Ticket 연동 시, 해당 세션에 판매된 티켓이 있는지 검증 추가

        sessionPort.deleteById(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Session> getSessionsByEventId(Long eventId) {
        return sessionPort.findByEventId(eventId);
    }

    @Override
    public void reorderSessions(Long eventId, Long requesterId, List<Long> sessionIds) {
        getEventAndValidateOwner(eventId, requesterId);

        List<Session> sessions = sessionPort.findByEventId(eventId);
        Map<Long, Session> sessionMap = sessions.stream()
                .collect(Collectors.toMap(Session::getId, Function.identity()));

        int order = 1;
        for (Long sessionId : sessionIds) {
            Session session = sessionMap.get(sessionId);
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
                        session.getMaxAttendees(),
                        session.getRecruitStartDate(),
                        session.getRecruitEndDate()
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
