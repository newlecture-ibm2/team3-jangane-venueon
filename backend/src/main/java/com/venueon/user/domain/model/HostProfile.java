package com.venueon.user.domain.model;

import java.time.LocalDateTime;

/**
 * HostProfile 도메인 모델 (순수 POJO)
 * 호스트 전용 프로필 정보 — users 테이블과 1:1 관계
 */
public class HostProfile {

    private Long id;
    private Long userId;
    private String orgName;
    private String orgNumber;
    private String managerName;
    private String orgDescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected HostProfile() {}

    public HostProfile(Long id, Long userId, String orgName, String orgNumber,
                       String managerName, String orgDescription,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.orgName = orgName;
        this.orgNumber = orgNumber;
        this.managerName = managerName;
        this.orgDescription = orgDescription;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- 비즈니스 행위 ---

    public void updateProfile(String orgName, String orgDescription, String managerName) {
        this.orgName = orgName;
        this.orgDescription = orgDescription;
        this.managerName = managerName;
        this.updatedAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getOrgName() { return orgName; }
    public String getOrgNumber() { return orgNumber; }
    public String getManagerName() { return managerName; }
    public String getOrgDescription() { return orgDescription; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
