package com.venueon.host.ticket.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 생성 요청 DTO
 */
public record TicketCreateRequest(
        @NotBlank String name,
        String description,
        @Min(0) int price,
        @Min(0) int originalPrice,
        Integer maxQuantity,        // null = 무제한
        boolean isAllSessions,
        List<Long> sessionIds,      // isAllSessions=false일 때 필수
        int sortOrder,
        LocalDateTime salesStart,   // null = 즉시
        LocalDateTime salesEnd      // null = 이벤트 종료까지
) {}
