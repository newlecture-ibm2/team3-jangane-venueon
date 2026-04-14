package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface EventJpaRepository extends JpaRepository<EventJpaEntity, Long>, JpaSpecificationExecutor<EventJpaEntity> {
    @org.springframework.data.jpa.repository.Query("SELECT e FROM EventJpaEntity e WHERE e.status.code = :status")
    Page<EventJpaEntity> findByStatus(@org.springframework.data.repository.query.Param("status") String status, Pageable pageable);

    Page<EventJpaEntity> findByStatusIn(List<EventStatus> statuses, Pageable pageable);

    Page<EventJpaEntity> findByStatusInAndCategory_Id(List<EventStatus> statuses, Long categoryId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EventJpaEntity e WHERE e.creator.id = :creatorId AND e.status.code = :status")
    Page<EventJpaEntity> findByCreatorIdAndStatus(@org.springframework.data.repository.query.Param("creatorId") Long creatorId, @org.springframework.data.repository.query.Param("status") String status, Pageable pageable);

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
