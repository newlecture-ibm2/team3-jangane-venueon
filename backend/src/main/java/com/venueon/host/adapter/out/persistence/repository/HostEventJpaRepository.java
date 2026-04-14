package com.venueon.host.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 호스트 전용 이벤트 조회 Repository
 * — event 모듈의 EventJpaRepository를 수정하지 않고 독립적으로 운영
 */
public interface HostEventJpaRepository extends JpaRepository<EventJpaEntity, Long> {

    /** 호스트 본인의 모든 이벤트 (페이지네이션) */
    Page<EventJpaEntity> findByCreatorId(Long creatorId, Pageable pageable);

    /** 호스트 본인의 이벤트 — 상태 필터 (페이지네이션) */
    @org.springframework.data.jpa.repository.Query("SELECT e FROM EventJpaEntity e WHERE e.creator.id = :creatorId AND e.status.code = :status")
    Page<EventJpaEntity> findByCreatorIdAndStatus(@org.springframework.data.repository.query.Param("creatorId") Long creatorId, @org.springframework.data.repository.query.Param("status") String status, Pageable pageable);
}
