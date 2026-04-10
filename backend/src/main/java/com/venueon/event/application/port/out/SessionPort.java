package com.venueon.event.application.port.out;

import com.venueon.event.domain.model.Session;

import java.util.List;
import java.util.Optional;

/**
 * 세션 저장/조회 인터페이스 (Port-Out)
 * Service는 이 포트만 의존 — JPA 직접 참조 금지
 * v6: EventSession → Session 리네이밍
 */
public interface SessionPort {

    Session save(Session session, Long eventId);

    Optional<Session> findById(Long id);

    List<Session> findByEventId(Long eventId);

    void deleteById(Long id);

    Optional<Session> findDefaultByEventId(Long eventId);

    int countByEventId(Long eventId);
}
