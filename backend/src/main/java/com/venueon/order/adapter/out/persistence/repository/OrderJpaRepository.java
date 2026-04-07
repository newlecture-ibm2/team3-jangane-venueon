package com.venueon.order.adapter.out.persistence.repository;

import com.venueon.host.dto.HostRecentOrderResponse;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {

    Page<OrderJpaEntity> findByUserId(Long userId, Pageable pageable);

    List<OrderJpaEntity> findByEventId(Long eventId);

    List<OrderJpaEntity> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventIdAndStatusIn(Long eventId, List<OrderStatus> statuses);

    @Query("""
            select new com.venueon.host.dto.HostRecentOrderResponse(
                o.id,
                e.title,
                o.amount,
                o.orderedAt,
                cast(o.status as string)
            )
            from OrderJpaEntity o
            join o.event e
            where e.creator.id = :creatorId
            order by o.orderedAt desc
            """)
    Page<HostRecentOrderResponse> findRecentOrdersByHostId(Long creatorId, Pageable pageable);
}
