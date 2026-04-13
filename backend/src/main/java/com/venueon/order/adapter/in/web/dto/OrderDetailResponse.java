package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * v6: ticket 정보 필드 추가
 */
@Getter
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    private Long orderId;
    private Long eventId;
    private String eventTitle;
    private String ticketName;
    private int ticketPrice;
    private String status;
    private int quantity;
    private int amount;
    private String paymentMethod;
    private LocalDateTime orderedAt;
    private LocalDateTime paidAt;
    // For MyPage Cards
    private String organizer;
    private String location;
    private String eventStatus;
}
