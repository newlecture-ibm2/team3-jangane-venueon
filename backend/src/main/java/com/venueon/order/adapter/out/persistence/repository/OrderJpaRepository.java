package com.venueon.order.adapter.out.persistence.repository;

import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {

    Page<OrderJpaEntity> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM OrderJpaEntity o WHERE o.user.id = :userId AND " +
           "(o.status != 'PENDING' OR (o.status = 'PENDING' AND o.paymentMethod = 'VIRTUAL_ACCOUNT')) AND " +
           "(:hasStatuses = false OR o.event.status IN :statuses)")
    Page<OrderJpaEntity> findValidOrdersByUserIdAndEventStatuses(
            @Param("userId") Long userId, 
            @Param("hasStatuses") boolean hasStatuses, 
            @Param("statuses") List<com.venueon.event.domain.model.EventStatus> statuses, 
            Pageable pageable);

    List<OrderJpaEntity> findByEventId(Long eventId);

    List<OrderJpaEntity> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventIdAndStatusIn(Long eventId, List<OrderStatus> statuses);

    java.util.Optional<OrderJpaEntity> findByTossOrderId(String tossOrderId);

    List<OrderJpaEntity> findByUserIdAndEventIdAndStatusIn(Long userId, Long eventId, List<OrderStatus> statuses);

    Page<OrderJpaEntity> findByEventIdIn(List<Long> eventIds, Pageable pageable);
}
