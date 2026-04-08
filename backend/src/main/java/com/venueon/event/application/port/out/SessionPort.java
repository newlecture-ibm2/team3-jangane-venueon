package com.venueon.event.application.port.out;

import com.venueon.event.domain.model.EventSession;

import java.util.List;
import java.util.Optional;

/**
 * 세션 저장/조회 인터페이스 (Port-Out)
 * Service는 이 포트만 의존 — JPA 직접 참조 금지
 */
public interface SessionPort {

    EventSession save(EventSession session, Long eventId);

    Optional<EventSession> findById(Long id);

    List<EventSession> findByEventId(Long eventId);

    void deleteById(Long id);

    Optional<EventSession> findDefaultByEventId(Long eventId);

    int countByEventId(Long eventId);
}
