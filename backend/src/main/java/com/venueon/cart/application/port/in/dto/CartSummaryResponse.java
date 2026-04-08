package com.venueon.cart.application.port.in.dto;

import java.util.List;

/**
 * 장바구니 요약 응답 DTO
 */
public record CartSummaryResponse(
        List<CartResponse> items,
        int itemCount,
        int totalAmount,
        int totalDiscount,
        int finalAmount
) {
    public CartSummaryResponse {
        finalAmount = totalAmount - totalDiscount;
    }
}
