package com.venueon.badge.adapter.in.web.dto.response;

import java.time.LocalDateTime;

/**
 * 뱃지 목록 응답 DTO
 */
public record BadgeListResponse(
        Long id,
        String badgeName,
        String badgeImageUrl,
        String category,
        String creatorNickname,
        String creatorProfileImg,
        LocalDateTime earnedAt,
        Long eventId,
        boolean isVisible
) {}
