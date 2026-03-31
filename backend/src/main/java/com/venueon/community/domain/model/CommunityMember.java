package com.venueon.community.domain.model;

import java.time.LocalDateTime;

/**
 * CommunityMember 도메인 모델 (순수 POJO)
 */
public class CommunityMember {

    private Long id;
    private Long communityId;
    private Long userId;
    private MemberRole role;
    private LocalDateTime joinedAt;

    protected CommunityMember() {}

    public CommunityMember(Long id, Long communityId, Long userId,
                           MemberRole role, LocalDateTime joinedAt) {
        this.id = id;
        this.communityId = communityId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public boolean isAdmin() {
        return this.role == MemberRole.ADMIN;
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getCommunityId() { return communityId; }
    public Long getUserId() { return userId; }
    public MemberRole getRole() { return role; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
}
