package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventSessionJpaRepository;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.EventSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * SessionPort 구현체 — JPA 연동
 */
@Component
@RequiredArgsConstructor
public class EventSessionPersistenceAdapter implements SessionPort {

    private final EventSessionJpaRepository sessionRepository;
    private final EventSessionMapper sessionMapper;

    @Override
    public EventSession save(EventSession session, Long eventId) {
        EventSessionJpaEntity entity = sessionMapper.toJpaEntity(session, eventId);
        EventSessionJpaEntity saved = sessionRepository.save(entity);
        return sessionMapper.toDomain(saved);
    }

    @Override
    public Optional<EventSession> findById(Long id) {
        return sessionRepository.findById(id)
                .map(sessionMapper::toDomain);
    }

    @Override
    public List<EventSession> findByEventId(Long eventId) {
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
    public Optional<EventSession> findDefaultByEventId(Long eventId) {
        return sessionRepository.findByEventIdAndIsDefaultTrue(eventId)
                .map(sessionMapper::toDomain);
    }

    @Override
    public int countByEventId(Long eventId) {
        return sessionRepository.countByEventId(eventId);
    }
}
