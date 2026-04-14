package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventTypeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EventTypeJpaRepository extends JpaRepository<EventTypeJpaEntity, Long> {
    Optional<EventTypeJpaEntity> findByCode(String code);
}
