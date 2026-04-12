package com.venueon.ticket.adapter.out.persistence.repository;

import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Ticket JPA Repository
 */
public interface TicketJpaRepository extends JpaRepository<TicketJpaEntity, Long> {

    List<TicketJpaEntity> findByEventIdOrderBySortOrder(Long eventId);

    List<TicketJpaEntity> findByEventId(Long eventId);

    /**
     * 비관적 잠금 조회 — 동시성 제어 (재고 초과 판매 방지)
     * OrderService에서 재고 차감 시 사용
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TicketJpaEntity t WHERE t.id = :id")
    Optional<TicketJpaEntity> findByIdForUpdate(@Param("id") Long id);

    /**
     * 여러 이벤트 ID로 티켓 벌크 조회
     * 이벤트 목록 API에서 N+1 방지용 (가격 정보 표시)
     */
    @Query("SELECT t FROM TicketJpaEntity t WHERE t.event.id IN :eventIds ORDER BY t.event.id, t.sortOrder")
    List<TicketJpaEntity> findByEventIdIn(@Param("eventIds") List<Long> eventIds);
}
