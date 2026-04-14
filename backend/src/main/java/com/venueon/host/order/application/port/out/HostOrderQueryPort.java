package com.venueon.host.order.application.port.out;

import com.venueon.host.order.adapter.in.web.dto.HostAttendeeResponse;
import com.venueon.host.order.adapter.in.web.dto.HostOrderDetailResponse;
import com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse;
import com.venueon.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Host 주문 조회 Port (out) — Hexagonal Architecture
 */
public interface HostOrderQueryPort {

    Page<HostRecentOrderResponse> findRecentOrdersByHostId(Long hostId, Pageable pageable);

    Page<HostRecentOrderResponse> findAllOrdersByHostId(Long hostId, OrderStatus status, Long eventId, Pageable pageable);

    HostOrderDetailResponse findOrderDetail(Long hostId, Long orderId);

    int sumRevenueByHostIdAndPeriod(Long hostId, OrderStatus status, LocalDateTime start, LocalDateTime end);

    long countTotalAttendeesByHostId(Long hostId);

    Page<HostAttendeeResponse> findAttendeesByHostId(Long hostId, Long eventId, String name, Pageable pageable);
}
