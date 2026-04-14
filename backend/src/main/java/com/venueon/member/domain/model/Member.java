package com.venueon.member.domain.model;

import java.time.LocalDateTime;

/**
 * Member 도메인 모델 (순수 POJO)
 */
public class Member {

    private Long id;
    private Long communityId;
    private Long userId;
    private MemberRole role;
    private LocalDateTime joinedAt;

    protected Member() {}

    public Member(Long id, Long communityId, Long userId,
                  MemberRole role, LocalDateTime joinedAt) {
        this.id = id;
        this.communityId = communityId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public boolean isManager() {
        return this.role == MemberRole.MANAGER;
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getCommunityId() { return communityId; }
    public Long getUserId() { return userId; }
    public MemberRole getRole() { return role; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
}
