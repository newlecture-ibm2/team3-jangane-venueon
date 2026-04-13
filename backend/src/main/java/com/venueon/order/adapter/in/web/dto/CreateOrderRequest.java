package com.venueon.order.adapter.in.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 통합 주문 생성 요청 DTO
 *
 * v6: 단건/배치 분리 → items[] 배열 기반 통합 주문
 *
 * 사용 예:
 *   단건: { items: [{ticketId: 5, quantity: 1}], paymentMethod: "CARD" }
 *   다건: { items: [{ticketId: 1, quantity: 2}, {ticketId: 5, quantity: 1}], paymentMethod: "CARD" }
 */
@Getter
@NoArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "주문 항목 목록은 필수입니다.")
    @Size(min = 1, message = "최소 1개 이상의 주문 항목이 필요합니다.")
    @Valid
    private List<OrderItemRequest> items;

    @NotBlank(message = "결제 수단은 필수입니다.")
    private String paymentMethod;

    @Getter
    @NoArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "티켓 ID는 필수입니다.")
        private Long ticketId;

        @Min(value = 1, message = "수량은 1 이상이어야 합니다.")
        private int quantity = 1;
    }
}
