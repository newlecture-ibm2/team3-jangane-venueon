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
    private UserRole role;
    private AuthProvider provider;
    private String profileImg;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 기본 생성자
    protected User() {}

    // 전체 필드 생성자
    public User(Long id, String email, String password, String nickname, UserRole role,
                AuthProvider provider, String profileImg, String phone,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
        this.provider = provider != null ? provider : AuthProvider.LOCAL;
        this.profileImg = profileImg;
        this.phone = phone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // 이전 생성자와의 호환성 유지
    public User(Long id, String email, String password, String nickname, UserRole role,
                String profileImg, String phone,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this(id, email, password, nickname, role, AuthProvider.LOCAL, profileImg, phone, createdAt, updatedAt);
    }

    // --- 비즈니스 행위 메서드 ---

    public boolean isHost() {
        return this.role == UserRole.HOST;
    }

    public boolean isAdmin() {
        return this.role == UserRole.ADMIN;
    }

    public boolean isGoogleUser() {
        return this.provider == AuthProvider.GOOGLE;
    }

    public void updateProfile(String nickname, String profileImg) {
        this.nickname = nickname;
        this.profileImg = profileImg;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePassword(String encodedNewPassword) {
        this.password = encodedNewPassword;
        this.updatedAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
    public UserRole getRole() { return role; }
    public AuthProvider getProvider() { return provider; }
    public String getProfileImg() { return profileImg; }
    public String getPhone() { return phone; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
