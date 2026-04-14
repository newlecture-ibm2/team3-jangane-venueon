package com.venueon.host.order.adapter.in.web.dto;

import java.time.LocalDateTime;

/**
 * 호스트 주문 상세 조회 — 응답 DTO
 *
 * 주문 목록에서 특정 주문을 클릭했을 때 보여주는 상세 정보입니다.
 * OrderJpaEntity + UserJpaEntity + EventJpaEntity + EventSessionJpaEntity를
 * 조인하여 필요한 필드만 추출합니다.
 */
public record HostOrderDetailResponse(
        // 주문 정보
        Long orderId,
        String status,
        int quantity,
        int amount,
        String paymentMethod,
        LocalDateTime orderedAt,
        LocalDateTime paidAt,

        // 주문자 정보
        String userName,
        String userEmail,
        String userPhone,

        // 강의 정보
        Long eventId,
        String eventTitle,
        String eventThumbnailUrl,

        // 세션 정보 (선택된 회차)
        String sessionTitle,
        LocalDateTime sessionStartTime,
        LocalDateTime sessionEndTime
) {}
