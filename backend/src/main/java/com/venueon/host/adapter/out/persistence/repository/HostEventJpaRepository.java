package com.venueon.host.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.domain.model.EventStatus;
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
    /** 호스트 본인의 이벤트 — 상태 필터 (페이지네이션) */
    Page<EventJpaEntity> findByCreatorIdAndStatus(Long creatorId, EventStatus status, Pageable pageable);

    /** 호스트 본인의 상세 조회 */
    java.util.Optional<EventJpaEntity> findByIdAndCreatorId(Long id, Long creatorId);
}
