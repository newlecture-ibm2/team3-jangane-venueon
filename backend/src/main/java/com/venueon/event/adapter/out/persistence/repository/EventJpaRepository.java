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

    Page<EventJpaEntity> findByStatusIn(List<EventStatus> statuses, Pageable pageable);

    Page<EventJpaEntity> findByStatusInAndCategory_Id(List<EventStatus> statuses, Long categoryId, Pageable pageable);

    Page<EventJpaEntity> findByCreatorIdAndStatus(Long creatorId, EventStatus status, Pageable pageable);

    Page<EventJpaEntity> findByTitleContainingIgnoreCaseAndStatusInAndCategory_Id(
        String keyword, List<EventStatus> statuses, Long categoryId, Pageable pageable);

    Page<EventJpaEntity> findByTitleContainingIgnoreCaseAndStatusIn(
        String keyword, List<EventStatus> statuses, Pageable pageable);

    Page<EventJpaEntity> findByTitleContainingIgnoreCaseAndCategory_Id(
        String keyword, Long categoryId, Pageable pageable);

    Page<EventJpaEntity> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<EventJpaEntity> findByCategory_Id(Long categoryId, Pageable pageable);

    boolean existsByCategory_Id(Long categoryId);
}
