package com.venueon.host.order.application.port.in;

import com.venueon.host.order.adapter.in.web.dto.HostAttendeeResponse;
import com.venueon.host.order.adapter.in.web.dto.HostOrderDetailResponse;
import com.venueon.host.order.adapter.in.web.dto.HostRecentOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 호스트 대시보드 — 최근 주문 내역 조회 유스케이스
 */
public interface GetHostRecentOrdersUseCase {

    List<HostRecentOrderResponse> getRecentOrders(Long hostId, int size);

    int getCurrentMonthRevenue(Long hostId);

    long getTotalAttendees(Long hostId);

    Page<HostAttendeeResponse> getAttendees(Long hostId, Long eventId, String name, Pageable pageable);

    Page<HostRecentOrderResponse> getAllOrders(Long hostId, String status, Long eventId, Pageable pageable);

    HostOrderDetailResponse getOrderDetail(Long hostId, Long orderId);
}

