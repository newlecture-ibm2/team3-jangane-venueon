package com.venueon.host.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.host.application.port.in.GetHostRecentOrdersUseCase;
import com.venueon.host.dto.HostRecentOrderResponse;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;

import java.util.List;

/**
 * 호스트 대시보드 — 최근 주문 조회 서비스
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class HostOrderService implements GetHostRecentOrdersUseCase {

    private final OrderJpaRepository orderJpaRepository;

    @Override
    public List<HostRecentOrderResponse> getRecentOrders(Long hostId, int size) {
        log.debug("호스트 최근 주문 조회: hostId={}, size={}", hostId, size);

        return orderJpaRepository
                .findRecentOrdersByHostId(hostId, PageRequest.of(0, size))
                .getContent();
    }
}
