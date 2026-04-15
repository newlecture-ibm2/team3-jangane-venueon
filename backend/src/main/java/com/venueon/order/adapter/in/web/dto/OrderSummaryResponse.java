package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryResponse {
    private Long orderId; // 대표 주문 ID
    private String tossOrderId; // 결제 그룹 식별 키
    private String orderName; // "이벤트 A 외 2건"
    private int totalAmount; // 총 결제 금액
    private int totalQuantity; // 총 주문 수량
    private String status; // 주문 상태
    private LocalDateTime orderedAt; // 주문 일시
    private LocalDateTime paidAt; // 결제 일시
    
    // UI 렌더링에 필요한 이벤트 상세 정보 복구
    private Long eventId;
    private String eventTitle;
    private com.venueon.common.dto.CodeDto eventStatus;
    private String organizer;
    private String location;
    private LocalDateTime eventStartDate;
    private int amount; // 단일 금액 (UI 역호환성)
    private String thumbnailUrl; // 이벤트 썸네일 이미지
    private Long categoryId; // 카테고리 ID (프론트에서 라벨 매핑)
}
