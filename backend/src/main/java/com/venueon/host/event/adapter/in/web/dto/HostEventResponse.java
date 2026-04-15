package com.venueon.host.event.adapter.in.web.dto;

import java.time.LocalDateTime;

/**
 * 호스트 이벤트 목록 응답 DTO
 */
public record HostEventResponse(
        Long id,
        String title,
        String thumbnailUrl,
        com.venueon.common.dto.CodeDto type,
        com.venueon.common.dto.CodeDto status,             // 계산된 상태 (ONGOING/ENDED 포함)
        com.venueon.common.dto.CodeDto recruitmentStatus,   // 모집 상태
        boolean hasSession,
        String description,
        LocalDateTime createdAt,
        Long price,                                       // 최저 판매가
        Long originalPrice,                                // 할인 전 가격
        boolean hasDiscount,                               // 할인 여부
        Long maxPrice,                                     // 최고 판매가
        LocalDateTime startDate,
        LocalDateTime endDate,
        String location,
        String hostName
) {}
