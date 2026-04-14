package com.venueon.admin.user.adapter.in.web.dto.response;

import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.HostProfile;
import com.venueon.common.dto.CodeDto;

import java.time.LocalDateTime;

/**
 * 회원 상세 응답 DTO
 */
public record AdminUserDetailResponse(
        Long id,
        String email,
        String nickname,
        CodeDto role,
        String phone,
        String profileImg,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        // 호스트 추가 정보
        String orgName,
        String orgNumber,
        String orgDescription
) {
    public static AdminUserDetailResponse from(User user, HostProfile hostProfile) {
        return new AdminUserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole() != null ? CodeDto.of(user.getRole().id(), user.getRole().label()) : null,
                user.getPhone(),
                user.getProfileImg(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                hostProfile != null ? hostProfile.getOrgName() : null,
                hostProfile != null ? hostProfile.getOrgNumber() : null,
                hostProfile != null ? hostProfile.getOrgDescription() : null
        );
    }
}
