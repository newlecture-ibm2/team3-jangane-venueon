package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class CreateOrderResponse {
    private Long orderId;
    private String tossOrderId;
    private int amount;
    private String orderName;
    private String customerName;
    private String customerEmail;
    private String tossClientKey;
}
