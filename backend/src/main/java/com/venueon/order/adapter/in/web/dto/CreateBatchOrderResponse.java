package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class CreateBatchOrderResponse {
    private List<Long> orderIds;
    private String tossOrderId;
    private int totalAmount;
    private String orderName;
    private String customerName;
    private String customerEmail;
    private String tossClientKey;
}
