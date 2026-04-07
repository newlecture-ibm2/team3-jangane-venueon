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

    List<OrderJpaEntity> findByEventId(Long eventId);

    List<OrderJpaEntity> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventIdAndStatusIn(Long eventId, List<OrderStatus> statuses);

    /**
     * 마이페이지 내 강의 목록: Order + Event + Creator를 fetch join으로 한 번에 조회
     */
    @Query("SELECT o FROM OrderJpaEntity o " +
           "JOIN FETCH o.event e " +
           "JOIN FETCH e.creator " +
           "WHERE o.user.id = :userId")
    List<OrderJpaEntity> findByUserIdWithEvent(@Param("userId") Long userId);
}
