package com.venueon.host.order.adapter.out.persistence.repository;

import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 협업 시 공통 OrderJpaRepository 수정을 피하기 위해 
 * 호스트 패키지 전용으로 만든 주문 조회 전용 Repository입니다.
 */
@Repository
public interface HostOrderQueryRepository extends JpaRepository<OrderJpaEntity, Long> {

    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM OrderJpaEntity o WHERE o.event.id = :eventId AND (o.status = 'PAID' OR o.status = 'REGISTERED')")
    long sumRevenueByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM OrderJpaEntity o WHERE o.event.id = :eventId AND (o.status = 'PAID' OR o.status = 'REGISTERED')")
    long countAttendeesByEventId(@Param("eventId") Long eventId);
}
