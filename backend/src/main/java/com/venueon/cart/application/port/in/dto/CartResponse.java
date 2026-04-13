package com.venueon.cart.application.port.in.dto;

import com.venueon.cart.domain.model.Cart;

import java.time.LocalDateTime;

/**
 * 장바구니 항목 응답 DTO
 *
 * v6: session 기반 → ticket 기반으로 전환
 */
public record CartResponse(
        Long cartId,
        Long eventId,
        String eventTitle,
        Long ticketId,
        String ticketName,
        int ticketPrice,
        int ticketOriginalPrice,
        int discountRate,
        int quantity,
        int subtotal,
        LocalDateTime createdAt
) {
    public static CartResponse from(Cart cart) {
        return new CartResponse(
                cart.getId(),
                cart.getEventId(),
                cart.getEventTitle(),
                cart.getTicketId(),
                cart.getTicketName(),
                cart.getTicketPrice(),
                cart.getTicketOriginalPrice(),
                cart.getDiscountRate(),
                cart.getQuantity(),
                cart.getSubtotal(),
                cart.getCreatedAt()
        );
    }
}
