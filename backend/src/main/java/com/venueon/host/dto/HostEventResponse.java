package com.venueon.host.dto;

import java.time.LocalDateTime;

/**
 * 호스트 이벤트 목록 응답 DTO
 */
public record HostEventResponse(
        Long id,
        String title,
        String thumbnailUrl,
        String type,
        String status,
        boolean hasSession,
        String description,
        LocalDateTime createdAt
) {}
