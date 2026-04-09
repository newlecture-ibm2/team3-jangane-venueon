package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventSessionJpaRepository extends JpaRepository<EventSessionJpaEntity, Long> {

    List<EventSessionJpaEntity> findByEventIdOrderBySortOrder(Long eventId);

    Optional<EventSessionJpaEntity> findByEventIdAndIsDefaultTrue(Long eventId);

    int countByEventId(Long eventId);
}
