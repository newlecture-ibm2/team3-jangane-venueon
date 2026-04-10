package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.domain.model.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface EventJpaRepository extends JpaRepository<EventJpaEntity, Long>, JpaSpecificationExecutor<EventJpaEntity> {

    Page<EventJpaEntity> findByStatus(EventStatus status, Pageable pageable);

    List<EventJpaEntity> findByCreatorId(Long creatorId);

    Page<EventJpaEntity> findByCreatorIdAndStatus(Long creatorId, EventStatus status, Pageable pageable);

    Page<EventJpaEntity> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<EventJpaEntity> findByCategoryId(Long categoryId, Pageable pageable);

    boolean existsByCategoryId(Long categoryId);
}
