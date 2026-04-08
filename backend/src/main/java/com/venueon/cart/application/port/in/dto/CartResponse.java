package com.venueon.cart.application.port.in.dto;

import com.venueon.cart.domain.model.Cart;

import java.time.LocalDateTime;

/**
 * 장바구니 항목 응답 DTO
 */
public record CartResponse(
        Long cartId,
        Long eventId,
        String eventTitle,
        int price,
        int discountedPrice,
        int quantity,
        int subtotal,
        LocalDateTime startDate,
        LocalDateTime createdAt
) {
    public static CartResponse from(Cart cart) {
        return new CartResponse(
                cart.getId(),
                cart.getEventId(),
                cart.getEventTitle(),
                cart.getPrice(),
                cart.getDiscountedPrice(),
                cart.getQuantity(),
                cart.getSubtotal(),
                cart.getStartDate(),
                cart.getCreatedAt()
        );
    }
}
