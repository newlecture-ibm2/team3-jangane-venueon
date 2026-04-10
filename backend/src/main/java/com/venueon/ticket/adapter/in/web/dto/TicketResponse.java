package com.venueon.ticket.adapter.in.web.dto;

import com.venueon.ticket.domain.model.Ticket;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 조회 응답 DTO
 */
public record TicketResponse(
        Long id,
        String name,
        String description,
        int price,
        int originalPrice,
        int discountRate,
        boolean isAllSessions,
        Integer maxQuantity,
        int soldCount,
        Integer remainingQuantity,
        boolean isOnSale,
        boolean isActive,
        LocalDateTime salesStart,
        LocalDateTime salesEnd,
        int sortOrder,
        List<Long> sessionIds
) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getName(),
                ticket.getDescription(),
                ticket.getPrice(),
                ticket.getOriginalPrice(),
                ticket.getDiscountRate(),
                ticket.getIsAllSessions(),
                ticket.getMaxQuantity(),
                ticket.getSoldCount(),
                ticket.getRemainingQuantity(),
                ticket.isOnSale(),
                ticket.getIsActive(),
                ticket.getSalesStart(),
                ticket.getSalesEnd(),
                ticket.getSortOrder(),
                ticket.getSessionIds()
        );
    }
}
