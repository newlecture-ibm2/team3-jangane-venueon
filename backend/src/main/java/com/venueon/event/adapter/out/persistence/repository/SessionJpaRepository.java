package com.venueon.event.adapter.out.persistence.repository;

import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * SessionJpaRepository — EventSessionJpaRepository에서 리네이밍
 */
public interface SessionJpaRepository extends JpaRepository<SessionJpaEntity, Long> {

    List<SessionJpaEntity> findByEventIdOrderBySortOrder(Long eventId);

    Optional<SessionJpaEntity> findByEventIdAndIsDefaultTrue(Long eventId);

    int countByEventId(Long eventId);

    /**
     * 비관적 잠금 조회 — 동시성 제어 (정원 초과 판매 방지)
     * OrderService에서 정원 차감 시 사용
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SessionJpaEntity s WHERE s.id = :id")
    Optional<SessionJpaEntity> findByIdForUpdate(@Param("id") Long id);

    /**
     * 여러 세션 ID로 일괄 조회
     * 개별 세션 티켓의 연결된 세션 목록을 가져올 때 사용
     */
    @Query("SELECT s FROM SessionJpaEntity s WHERE s.id IN :ids ORDER BY s.sortOrder")
    List<SessionJpaEntity> findAllByIds(@Param("ids") List<Long> ids);

    /**
     * 여러 이벤트 ID로 세션 벌크 조회
     * 이벤트 목록 API에서 N+1 방지용
     */
    @Query("SELECT s FROM SessionJpaEntity s WHERE s.event.id IN :eventIds ORDER BY s.event.id, s.sortOrder")
    List<SessionJpaEntity> findByEventIdIn(@Param("eventIds") List<Long> eventIds);
}
