package com.venueon.host.dto;

import java.time.LocalDateTime;

/**
 * 호스트 이벤트 목록 응답 DTO
 */
public record HostEventResponse(
        Long id,
        String title,
        String thumbnailUrl,
        com.venueon.common.dto.CodeDto type,
        com.venueon.common.dto.CodeDto status,
        boolean hasSession,
        String description,
        LocalDateTime createdAt
) {}
