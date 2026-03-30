package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventJpaRepository extends JpaRepository<EventJpaEntity, Long> {
}
