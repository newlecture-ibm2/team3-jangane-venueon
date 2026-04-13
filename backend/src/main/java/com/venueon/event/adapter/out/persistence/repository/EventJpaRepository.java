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

    List<EventJpaEntity> findByCreatorId(Long creatorId);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EventJpaEntity e WHERE e.creator.id = :creatorId AND e.status.code = :status")
    Page<EventJpaEntity> findByCreatorIdAndStatus(@org.springframework.data.repository.query.Param("creatorId") Long creatorId, @org.springframework.data.repository.query.Param("status") String status, Pageable pageable);

    Page<EventJpaEntity> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<EventJpaEntity> findByCategoryId(Long categoryId, Pageable pageable);

    boolean existsByCategoryId(Long categoryId);
}
