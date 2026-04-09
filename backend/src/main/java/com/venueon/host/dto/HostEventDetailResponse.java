package com.venueon.host.dto;

import java.time.LocalDateTime;

/**
 * 호스트 이벤트 상세 응답 DTO
 * — 목록용 HostEventResponse와 달리 description 등 상세 필드 포함
 */
public record HostEventDetailResponse(
        Long id,
        String title,
        String description,
        String thumbnailUrl,
        String type,
        String status,
        int price,
        LocalDateTime startDate,
        LocalDateTime endDate,
        int maxAttendees,
        String location,
        boolean isOnline,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
