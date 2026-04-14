package com.venueon.admin.user.adapter.in.web.dto.response;

import com.venueon.user.domain.model.User;

import java.time.LocalDateTime;

/**
 * 회원 목록용 간략 응답 DTO
 */
public record AdminUserListResponse(
        Long id,
        String email,
        String nickname,
        com.venueon.common.dto.CodeDto role,
        boolean active,
        LocalDateTime createdAt
) {
    public static AdminUserListResponse from(User user) {
        return new AdminUserListResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole() != null ? com.venueon.common.dto.CodeDto.of(user.getRole().id(), user.getRole().label()) : null,
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
