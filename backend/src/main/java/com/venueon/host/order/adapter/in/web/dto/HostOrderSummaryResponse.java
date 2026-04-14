package com.venueon.host.order.adapter.in.web.dto;

/**
 * 호스트 대시보드 — 주문 요약 응답 DTO
 */
public record HostOrderSummaryResponse(
        int currentMonthRevenue,
        long totalAttendees
) {}
