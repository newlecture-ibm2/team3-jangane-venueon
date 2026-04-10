package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * SessionJpaRepository — EventSessionJpaRepository에서 리네이밍
 */
public interface SessionJpaRepository extends JpaRepository<SessionJpaEntity, Long> {

    List<SessionJpaEntity> findByEventIdOrderBySortOrder(Long eventId);

    Optional<SessionJpaEntity> findByEventIdAndIsDefaultTrue(Long eventId);

    int countByEventId(Long eventId);
}
