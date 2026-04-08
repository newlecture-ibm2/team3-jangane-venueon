package com.venueon.host.dto;

/**
 * 호스트 대시보드 — 주문 요약 응답 DTO
 */
public record HostOrderSummaryResponse(
        int currentMonthRevenue
) {}
