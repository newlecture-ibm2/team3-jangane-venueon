package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * SessionPort 구현체 — JPA 연동
 * v6: EventSessionPersistenceAdapter → SessionPersistenceAdapter 리네이밍
 */
@Component
@RequiredArgsConstructor
public class SessionPersistenceAdapter implements SessionPort {

    private final SessionJpaRepository sessionRepository;
    private final SessionMapper sessionMapper;

    @Override
    public Session save(Session session, Long eventId) {
        SessionJpaEntity entity = sessionMapper.toJpaEntity(session, eventId);
        SessionJpaEntity saved = sessionRepository.save(entity);
        return sessionMapper.toDomain(saved);
    }

    @Override
    public Optional<Session> findById(Long id) {
        return sessionRepository.findById(id)
                .map(sessionMapper::toDomain);
    }

    @Override
    public List<Session> findByEventId(Long eventId) {
        return sessionRepository.findByEventIdOrderBySortOrder(eventId)
                .stream()
                .map(sessionMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        sessionRepository.deleteById(id);
    }

    @Override
    public Optional<Session> findDefaultByEventId(Long eventId) {
        return sessionRepository.findByEventIdAndIsDefaultTrue(eventId)
                .map(sessionMapper::toDomain);
    }

    @Override
    public int countByEventId(Long eventId) {
        return sessionRepository.countByEventId(eventId);
    }
}
