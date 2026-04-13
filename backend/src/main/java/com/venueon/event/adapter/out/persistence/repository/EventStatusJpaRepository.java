package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventStatusJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EventStatusJpaRepository extends JpaRepository<EventStatusJpaEntity, Long> {
    Optional<EventStatusJpaEntity> findByCode(String code);
}
