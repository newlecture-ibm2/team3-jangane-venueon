package com.venueon.community.domain.model;

import java.time.LocalDateTime;

/**
 * Community 도메인 모델 (순수 POJO)
 */
public class Community {

    private Long id;
    private Long eventId;
    private Long creatorId;
    private String name;
    private String description;
    private String thumbnailUrl;
    private int memberCount;
    private boolean isPublic;
    private LocalDateTime createdAt;

    protected Community() {}

    public Community(Long id, Long eventId, Long creatorId, String name, String description,
                     String thumbnailUrl, int memberCount, boolean isPublic, LocalDateTime createdAt) {
        this.id = id;
        this.eventId = eventId;
        this.creatorId = creatorId;
        this.name = name;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.memberCount = memberCount;
        this.isPublic = isPublic;
        this.createdAt = createdAt;
    }

    // --- 비즈니스 행위 ---

    public boolean isOwnedBy(Long userId) {
        return this.creatorId != null && this.creatorId.equals(userId);
    }

    public void incrementMemberCount() {
        this.memberCount++;
    }

    public void decrementMemberCount() {
        if (this.memberCount > 0) {
            this.memberCount--;
        }
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public Long getCreatorId() { return creatorId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public int getMemberCount() { return memberCount; }
    public boolean getIsPublic() { return isPublic; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
