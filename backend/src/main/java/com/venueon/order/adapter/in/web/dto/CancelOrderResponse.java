package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CancelOrderResponse {
    private Long orderId;
    private String eventTitle;
    private int amount;
    private String status;
    private String reason;
    private LocalDateTime cancelledAt;
}
