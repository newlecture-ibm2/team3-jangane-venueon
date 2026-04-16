package com.venueon.order.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * v6: ticket 정보 필드 추가
 * v7: 온라인 세션 정보 추가 (구매자에게만 제공)
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
    private com.venueon.common.dto.CodeDto eventStatus;

    // 온라인 세션 입장 정보 (구매자 전용, 종료된 세션은 제외)
    private List<OnlineSessionInfo> onlineSessions;

    /**
     * 온라인 세션 입장 정보 DTO
     * - 구매한 티켓에 연결된 온라인 세션의 링크를 제공
     * - 세션이 종료(endTime 경과)되면 응답에서 제외됨
     */
    @Getter
    @AllArgsConstructor
    @Builder
    public static class OnlineSessionInfo {
        private Long sessionId;
        private String title;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String onlineLink;
        private boolean isLive; // 현재 진행 중 여부
    }
}
