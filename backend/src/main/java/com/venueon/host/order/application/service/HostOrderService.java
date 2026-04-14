package com.venueon.host.order.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.host.order.application.port.in.GetHostRecentOrdersUseCase;
import com.venueon.host.order.application.port.out.HostOrderQueryPort;
import com.venueon.host.order.adapter.in.web.dto.HostAttendeeResponse;
import com.venueon.host.order.adapter.in.web.dto.HostOrderDetailResponse;
import com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse;
import com.venueon.order.domain.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 호스트 대시보드 — Port 인터페이스만 의존 (JPA 직접 참조 제거)
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class HostOrderService implements GetHostRecentOrdersUseCase {

    private final HostOrderQueryPort hostOrderQueryPort;

    @Override
    public List<HostRecentOrderResponse> getRecentOrders(Long hostId, int size) {
        log.debug("호스트 최근 주문 조회: hostId={}, size={}", hostId, size);
        return hostOrderQueryPort.findRecentOrdersByHostId(hostId, PageRequest.of(0, size))
                .getContent();
    }

    @Override
    public int getCurrentMonthRevenue(Long hostId) {
        LocalDate now = LocalDate.now();
        LocalDateTime startDateTime = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDateTime = now.plusMonths(1).withDayOfMonth(1).atStartOfDay();
        return hostOrderQueryPort.sumRevenueByHostIdAndPeriod(hostId, OrderStatus.PAID, startDateTime, endDateTime);
    }

    @Override
    public long getTotalAttendees(Long hostId) {
        return hostOrderQueryPort.countTotalAttendeesByHostId(hostId);
    }

    @Override
    public Page<HostAttendeeResponse> getAttendees(Long hostId, Long eventId, String name, Pageable pageable) {
        log.debug("호스트 수강생 목록 조회: hostId={}, eventId={}, name={}", hostId, eventId, name);
        return hostOrderQueryPort.findAttendeesByHostId(hostId, eventId, name, pageable);
    }

    @Override
    public Page<HostRecentOrderResponse> getAllOrders(Long hostId, String status, Long eventId, Pageable pageable) {
        log.debug("호스트 전체 주문 조회: hostId={}, status={}, eventId={}", hostId, status, eventId);
        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                orderStatus = OrderStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("유효하지 않은 주문 상태: {}", status);
            }
        }
        return hostOrderQueryPort.findAllOrdersByHostId(hostId, orderStatus, eventId, pageable);
    }

    @Override
    public HostOrderDetailResponse getOrderDetail(Long hostId, Long orderId) {
        log.debug("호스트 주문 상세 조회: hostId={}, orderId={}", hostId, orderId);
        return hostOrderQueryPort.findOrderDetail(hostId, orderId);
    }
}
