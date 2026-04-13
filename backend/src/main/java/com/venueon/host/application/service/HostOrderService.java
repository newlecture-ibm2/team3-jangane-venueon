package com.venueon.host.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.host.application.port.in.GetHostRecentOrdersUseCase;
import com.venueon.host.dto.HostAttendeeResponse;
import com.venueon.host.dto.HostOrderDetailResponse;
import com.venueon.host.dto.HostRecentOrderResponse;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Override
    public int getCurrentMonthRevenue(Long hostId) {
        LocalDate now = LocalDate.now();
        LocalDateTime startDateTime = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDateTime = now.plusMonths(1).withDayOfMonth(1).atStartOfDay();

        return orderJpaRepository.sumRevenueByHostIdAndPeriod(
                hostId,
                OrderStatus.PAID,
                startDateTime,
                endDateTime
        );
    }

    @Override
    public long getTotalAttendees(Long hostId) {
        return orderJpaRepository.countTotalAttendeesByHostId(hostId);
    }

    @Override
    public Page<HostAttendeeResponse> getAttendees(Long hostId, Long eventId, String name, Pageable pageable) {
        log.debug("호스트 수강생 목록 조회: hostId={}, eventId={}, name={}, page={}, size={}", hostId, eventId, name, pageable.getPageNumber(), pageable.getPageSize());
        return orderJpaRepository.findAttendeesByHostId(hostId, eventId, name, pageable);
    }

    @Override
    public Page<HostRecentOrderResponse> getAllOrders(Long hostId, String status, Long eventId, Pageable pageable) {
        log.debug("호스트 전체 주문 조회: hostId={}, status={}, eventId={}, page={}, size={}", hostId, status, eventId, pageable.getPageNumber(), pageable.getPageSize());

        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                orderStatus = OrderStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("유효하지 않은 주문 상태: {}", status);
            }
        }
        return orderJpaRepository.findAllOrdersByHostId(hostId, orderStatus, eventId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public HostOrderDetailResponse getOrderDetail(Long hostId, Long orderId) {
        log.debug("호스트 주문 상세 조회: hostId={}, orderId={}", hostId, orderId);

        OrderJpaEntity order = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));

        // 해당 호스트의 주문인지 검증
        if (!order.getEvent().getCreator().getId().equals(hostId)) {
            throw new SecurityException("해당 주문에 대한 접근 권한이 없습니다.");
        }

        SessionJpaEntity session = order.getSession();

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
                session != null ? session.getTitle() : null,
                session != null ? session.getStartTime() : null,
                session != null ? session.getEndTime() : null
        );
    }
}

