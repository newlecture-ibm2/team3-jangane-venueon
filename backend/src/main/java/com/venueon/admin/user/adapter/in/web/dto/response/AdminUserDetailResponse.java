package com.venueon.admin.user.adapter.in.web.dto.response;

import com.venueon.user.domain.model.User;

import java.time.LocalDateTime;

/**
 * 회원 상세 응답 DTO
 */
public record AdminUserDetailResponse(
        Long id,
        String email,
        String nickname,
        String role,
        String phone,
        String profileImg,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AdminUserDetailResponse from(User user) {
        return new AdminUserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getPhone(),
                user.getProfileImg(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
