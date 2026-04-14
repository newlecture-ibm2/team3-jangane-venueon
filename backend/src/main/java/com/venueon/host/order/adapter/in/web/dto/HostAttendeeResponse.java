package com.venueon.host.order.adapter.in.web.dto;

import java.time.LocalDateTime;

/**
 * 호스트 수강생 목록 — 응답 DTO
 *
 * JPQL의 new 생성자 표현식으로 직접 생성됩니다.
 * OrderJpaEntity → UserJpaEntity, EventJpaEntity를 조인하여 필요한 필드만 추출합니다.
 */
public record HostAttendeeResponse(
        Long orderId,           // 주문 ID (고유 식별)
        String userName,        // 수강생 이름 (nickname)
        String userEmail,       // 수강생 이메일
        String userProfileImg,  // 수강생 프로필 이미지
        String eventTitle,      // 수강 강의명
        int amount,             // 결제 금액
        LocalDateTime orderedAt,// 신청일시
        String status           // 주문 상태 (PAID, REGISTERED 등)
) {}
