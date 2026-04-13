package com.venueon.host.ticket.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 수정 요청 DTO
 */
public record TicketUpdateRequest(
        @NotBlank String name,
        String description,
        @Min(0) int price,
        @Min(0) int originalPrice,
        Integer maxQuantity,
        boolean isAllSessions,
        List<Long> sessionIds,
        int sortOrder,
        boolean isActive,
        LocalDateTime salesStart,
        LocalDateTime salesEnd
) {}
