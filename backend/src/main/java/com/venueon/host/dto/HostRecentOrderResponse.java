package com.venueon.host.dto;

import java.time.LocalDateTime;

/**
 * 호스트 대시보드 — 최근 주문 내역 응답 DTO
 */
public record HostRecentOrderResponse(
        Long orderId,
        String userName,
        String eventTitle,
        int amount,
        LocalDateTime orderedAt,
        String status
) {}
