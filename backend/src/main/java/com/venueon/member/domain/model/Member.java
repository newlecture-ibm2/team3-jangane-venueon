package com.venueon.member.domain.model;

import java.time.LocalDateTime;

/**
 * Member 도메인 모델 (순수 POJO)
 */
public class Member {

    private Long id;
    private Long communityId;
    private Long userId;
    private boolean manager; // boolean으로 변경
    private LocalDateTime joinedAt;

    protected Member() {}

    public Member(Long id, Long communityId, Long userId,
                  boolean manager, LocalDateTime joinedAt) {
        this.id = id;
        this.communityId = communityId;
        this.userId = userId;
        this.manager = manager;
        this.joinedAt = joinedAt;
    }

    public boolean isManager() {
        return this.manager;
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getCommunityId() { return communityId; }
    public Long getUserId() { return userId; }
    public boolean isManagerValue() { return manager; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
}
