package com.venueon.host.order.adapter.out.persistence;

import com.venueon.host.order.adapter.in.web.dto.HostAttendeeResponse;
import com.venueon.host.order.adapter.in.web.dto.HostOrderDetailResponse;
import com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse;
import com.venueon.host.order.application.port.out.HostOrderQueryPort;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * HostOrderQueryPort 구현체 — JPA 접근은 이 Adapter에서만 수행.
 */
@Component
@RequiredArgsConstructor
public class HostOrderPersistenceAdapter implements HostOrderQueryPort {

    private final OrderJpaRepository orderJpaRepository;

    @Override
    public Page<HostRecentOrderResponse> findRecentOrdersByHostId(Long hostId, Pageable pageable) {
        return orderJpaRepository.findRecentOrdersByHostId(hostId, pageable);
    }

    @Override
    public Page<HostRecentOrderResponse> findAllOrdersByHostId(Long hostId, OrderStatus status, Long eventId, Pageable pageable) {
        return orderJpaRepository.findAllOrdersByHostId(hostId, status, eventId, pageable);
    }

    @Override
    public HostOrderDetailResponse findOrderDetail(Long hostId, Long orderId) {
        OrderJpaEntity order = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));

        if (!order.getEvent().getCreator().getId().equals(hostId)) {
            throw new SecurityException("해당 주문에 대한 접근 권한이 없습니다.");
        }

        TicketJpaEntity ticket = order.getTicket();

        return new HostOrderDetailResponse(
                order.getId(),
                order.getStatus().name(),
                order.getQuantity(),
                order.getAmount(),
                order.getPaymentMethod(),
                order.getDisplayOrderedAt() != null ? order.getDisplayOrderedAt() : order.getOrderedAt(),
                order.getPaidAt(),
                order.getUser().getNickname(),
                order.getUser().getEmail(),
                order.getUser().getPhone(),
                order.getEvent().getId(),
                order.getEvent().getTitle(),
                order.getEvent().getThumbnailUrl(),
                ticket != null ? ticket.getName() : null,
                null,
                null
        );
    }

    @Override
    public int sumRevenueByHostIdAndPeriod(Long hostId, OrderStatus status, LocalDateTime start, LocalDateTime end) {
        return orderJpaRepository.sumRevenueByHostIdAndPeriod(hostId, status, start, end);
    }

    @Override
    public long countTotalAttendeesByHostId(Long hostId) {
        return orderJpaRepository.countTotalAttendeesByHostId(hostId);
    }

    @Override
    public Page<HostAttendeeResponse> findAttendeesByHostId(Long hostId, Long eventId, String name, Pageable pageable) {
        return orderJpaRepository.findAttendeesByHostId(hostId, eventId, name, pageable);
    }
}
