package com.venueon.badge.adapter.in.web.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 뱃지 상세 응답 DTO (세션 정보 포함)
 */
public record BadgeDetailResponse(
        Long id,
        String badgeName,
        String badgeImageUrl,
        String category,
        String creatorNickname,
        String creatorProfileImg,
        LocalDateTime earnedAt,
        Long eventId,
        boolean isVisible,
        List<SessionInfo> sessions
) {
    public record SessionInfo(
            String title,
            LocalDateTime startTime,
            LocalDateTime endTime,
            boolean isOnline,
            String location
    ) {}
}
