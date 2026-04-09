package com.venueon.order.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "이벤트 ID는 필수입니다.")
    private Long eventId;

    private Long sessionId;

    @Min(value = 1, message = "수량은 1 이상이어야 합니다.")
    private int quantity = 1;

    @NotBlank(message = "결제 수단은 필수입니다.")
    private String paymentMethod;
}
