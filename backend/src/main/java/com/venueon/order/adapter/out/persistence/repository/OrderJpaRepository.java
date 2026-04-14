package com.venueon.order.adapter.out.persistence.repository;

import com.venueon.host.order.adapter.in.web.dto.HostAttendeeResponse;
import com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * v6: session 기반 쿼리 → ticket 기반으로 전환
 */
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {

    Page<OrderJpaEntity> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM OrderJpaEntity o WHERE o.user.id = :userId AND " +
           "o.id IN (SELECT MIN(o2.id) FROM OrderJpaEntity o2 WHERE o2.user.id = :userId GROUP BY o2.tossOrderId) AND " +
           "(o.status != 'PENDING' OR (o.status = 'PENDING' AND o.paymentMethod = 'VIRTUAL_ACCOUNT')) AND " +
           "(:hasStatuses = false OR o.event.status.code IN :statuses)")
    Page<OrderJpaEntity> findValidOrdersByUserIdAndEventStatuses(
            @Param("userId") Long userId,
            @Param("hasStatuses") boolean hasStatuses,
            @Param("statuses") List<String> statuses,
            Pageable pageable);

    List<OrderJpaEntity> findByEventId(Long eventId);

    List<OrderJpaEntity> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventIdAndStatusIn(Long eventId, List<OrderStatus> statuses);

    // v6: ticket 기반 쿼리
    long countByTicketIdAndStatusIn(Long ticketId, List<OrderStatus> statuses);

    @Query("""
            select new com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse(
                o.id,
                u.nickname,
                e.title,
                o.amount,
                coalesce(o.displayOrderedAt, o.orderedAt),
                cast(o.status as string)
            )
            from OrderJpaEntity o
            join o.user u
            join o.event e
            where e.creator.id = :creatorId
            order by coalesce(o.displayOrderedAt, o.orderedAt) desc
            """)
    Page<HostRecentOrderResponse> findRecentOrdersByHostId(Long creatorId, Pageable pageable);

    @Query("""
            select new com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse(
                o.id,
                u.nickname,
                e.title,
                o.amount,
                coalesce(o.displayOrderedAt, o.orderedAt),
                cast(o.status as string)
            )
            from OrderJpaEntity o
            join o.user u
            join o.event e
            where e.creator.id = :creatorId
              and (:status is null or o.status = :status)
              and (:eventId is null or e.id = :eventId)
            order by coalesce(o.displayOrderedAt, o.orderedAt) desc
            """)
    Page<HostRecentOrderResponse> findAllOrdersByHostId(
            @Param("creatorId") Long creatorId,
            @Param("status") OrderStatus status,
            @Param("eventId") Long eventId,
            Pageable pageable
    );

    @Query("""
            select coalesce(sum(o.amount), 0)
            from OrderJpaEntity o
            join o.event e
            where e.creator.id = :creatorId
              and o.status = :status
              and o.orderedAt >= :startDateTime
              and o.orderedAt < :endDateTime
            """)
    int sumRevenueByHostIdAndPeriod(
            @Param("creatorId") Long creatorId,
            @Param("status") OrderStatus status,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    java.util.Optional<OrderJpaEntity> findByTossOrderId(String tossOrderId);

    List<OrderJpaEntity> findAllByTossOrderId(String tossOrderId);

    List<OrderJpaEntity> findByUserIdAndEventIdAndStatusIn(Long userId, Long eventId, List<OrderStatus> statuses);

    // v6: ticket 기반 중복 검증
    List<OrderJpaEntity> findByUserIdAndTicketIdAndStatusIn(Long userId, Long ticketId, List<OrderStatus> statuses);

    Page<OrderJpaEntity> findByEventIdIn(List<Long> eventIds, Pageable pageable);

    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.user.id = :userId AND " +
           "(o.status = 'PAID' OR o.status = 'REGISTERED') AND " +
           "o.event.status.code = 'ONGOING'")
    long countOngoingByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.user.id = :userId AND " +
           "(o.status = 'PAID' OR o.status = 'REGISTERED') AND " +
           "o.event.status.code = 'ENDED'")
    long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(o) FROM OrderJpaEntity o " +
           "JOIN o.event e " +
           "WHERE e.creator.id = :hostId " +
           "AND (o.status = 'PAID' OR o.status = 'REGISTERED')")
    long countTotalAttendeesByHostId(@Param("hostId") Long hostId);

    @Query("""
            select new com.venueon.host.order.adapter.in.web.dto.HostAttendeeResponse(
                o.id,
                u.nickname,
                u.email,
                u.profileImg,
                e.title,
                o.amount,
                coalesce(o.displayOrderedAt, o.orderedAt),
                cast(o.status as string)
            )
            from OrderJpaEntity o
            join o.user u
            join o.event e
            where e.creator.id = :hostId
              and (o.status = 'PAID' or o.status = 'REGISTERED')
              and (:eventId is null or e.id = :eventId)
              and (:name is null or u.nickname like %:name%)
            """)
    Page<HostAttendeeResponse> findAttendeesByHostId(
            @Param("hostId") Long hostId,
            @Param("eventId") Long eventId,
            @Param("name") String name,
            Pageable pageable
    );
}
