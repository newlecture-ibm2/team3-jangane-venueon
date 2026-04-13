package com.venueon.user.domain.model;

import java.time.LocalDateTime;

/**
 * User 도메인 모델 (순수 POJO)
 * JPA/Spring 의존 없음 — 비즈니스 로직만 포함
 * 호스트 전용 프로필 정보는 HostProfile 도메인에서 관리
 */
public class User {

    private Long id;
    private String email;
    private String password;
    private String nickname;
    private com.venueon.common.model.DomainCode role;
    private AuthProvider provider;
    private String profileImg;
    private String phone;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private java.util.List<String> categories = new java.util.ArrayList<>();
    private boolean badgeVisible;

    // 기본 생성자
    protected User() {}

    // 전체 필드 생성자
    public User(Long id, String email, String password, String nickname, com.venueon.common.model.DomainCode role,
                AuthProvider provider, String profileImg, String phone, boolean active,
                LocalDateTime createdAt, LocalDateTime updatedAt, 
                java.util.List<String> categories, boolean badgeVisible) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
        this.provider = provider != null ? provider : AuthProvider.LOCAL;
        this.profileImg = profileImg;
        this.phone = phone;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.categories = categories != null ? categories : new java.util.ArrayList<>();
        this.badgeVisible = badgeVisible;
    }

    // 구버전 호환용 생성자
    public User(Long id, String email, String password, String nickname, com.venueon.common.model.DomainCode role,
                AuthProvider provider, String profileImg, String phone, boolean active,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this(id, email, password, nickname, role, provider, profileImg, phone, active, createdAt, updatedAt, new java.util.ArrayList<>(), true);
    }

    // --- 비즈니스 행위 메서드 ---

    public boolean isHost() {
        return this.role != null && this.role.id().equals(com.venueon.common.model.CodeConstants.ROLE_HOST_ID);
    }

    public boolean isAdmin() {
        return this.role != null && this.role.id().equals(com.venueon.common.model.CodeConstants.ROLE_ADMIN_ID);
    }

    public boolean isGoogleUser() {
        return this.provider == AuthProvider.GOOGLE;
    }

    public void updateProfile(String nickname, String profileImg, java.util.List<String> categories, Boolean showBadge) {
        this.nickname = nickname;
        this.profileImg = profileImg;
        if (categories != null) {
            this.categories = categories;
        }
        if (showBadge != null) {
            this.badgeVisible = showBadge;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePassword(String encodedNewPassword) {
        this.password = encodedNewPassword;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 역할 변경 (어드민 전용)
     */
    public void changeRole(com.venueon.common.model.DomainCode newRole) {
        this.role = newRole;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 닉네임 변경 (어드민 전용)
     */
    public void changeNickname(String newNickname) {
        this.nickname = newNickname;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 전화번호 변경 (어드민 전용)
     */
    public void changePhone(String newPhone) {
        this.phone = newPhone;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 계정 비활성화 (정지)
     */
    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 계정 활성화 (정지 해제)
     */
    public void activate() {
        this.active = true;
        this.updatedAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
    public com.venueon.common.model.DomainCode getRole() { return role; }
    public AuthProvider getProvider() { return provider; }
    public String getProfileImg() { return profileImg; }
    public String getPhone() { return phone; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public java.util.List<String> getCategories() { return categories; }
    public boolean isBadgeVisible() { return badgeVisible; }
}
