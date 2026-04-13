package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 통합 주문 생성 응답 DTO
 *
 * v6: 단건/배치 응답 통합 — orderIds 리스트로 반환
 */
@Getter
@AllArgsConstructor
@Builder
public class CreateOrderResponse {
    private List<Long> orderIds;      // 생성된 주문 ID 목록
    private String tossOrderId;
    private int totalAmount;          // 합산 결제 금액
    private String orderName;
    private String customerName;
    private String customerEmail;
    private String tossClientKey;
}
