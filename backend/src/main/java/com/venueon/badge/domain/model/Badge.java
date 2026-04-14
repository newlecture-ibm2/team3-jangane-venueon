package com.venueon.badge.domain.model;

import java.time.LocalDateTime;

/**
 * Badge 도메인 모델 (순수 POJO)
 * 사용자가 이벤트를 수료하면 자동 발급되는 뱃지
 */
public class Badge {

    private Long id;
    private Long userId;
    private Long eventId;       // nullable — 이벤트 삭제 시 SET NULL
    private String badgeName;
    private String badgeImageUrl;
    private boolean visible;
    private LocalDateTime earnedAt;

    protected Badge() {}

    public Badge(Long id, Long userId, Long eventId, String badgeName,
                 String badgeImageUrl, boolean visible, LocalDateTime earnedAt) {
        this.id = id;
        this.userId = userId;
        this.eventId = eventId;
        this.badgeName = badgeName;
        this.badgeImageUrl = badgeImageUrl;
        this.visible = visible;
        this.earnedAt = earnedAt;
    }

    public static Badge create(Long userId, Long eventId, String badgeName,
                               String badgeImageUrl, LocalDateTime earnedAt) {
        return new Badge(null, userId, eventId, badgeName, badgeImageUrl, true, earnedAt);
    }

    // --- Getters ---
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getEventId() { return eventId; }
    public String getBadgeName() { return badgeName; }
    public String getBadgeImageUrl() { return badgeImageUrl; }
    public boolean isVisible() { return visible; }
    public LocalDateTime getEarnedAt() { return earnedAt; }

    public void toggleVisibility() {
        this.visible = !this.visible;
    }
}
