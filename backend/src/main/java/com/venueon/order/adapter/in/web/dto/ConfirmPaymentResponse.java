package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class ConfirmPaymentResponse {
    private Long orderId;
    private String orderName;
    private String status;
    private int amount;
    private String paymentMethod;
    private LocalDateTime paidAt;
}
