package com.venueon.host.application.port.in;

import com.venueon.host.dto.HostRecentOrderResponse;

import java.util.List;

/**
 * 호스트 대시보드 — 최근 주문 내역 조회 유스케이스
 */
public interface GetHostRecentOrdersUseCase {

    List<HostRecentOrderResponse> getRecentOrders(Long hostId, int size);

    int getCurrentMonthRevenue(Long hostId);
}
