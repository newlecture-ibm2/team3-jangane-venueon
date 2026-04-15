package com.venueon.user.adapter.in.web.dto;

/**
 * 사용자 정보 응답 DTO
 */
public record UserInfoResponse(
        Long id,
        String email,
        String nickname,
        com.venueon.common.dto.CodeDto role,
        String profileImg,
        java.util.List<String> categories,
        Boolean showBadge,
        String provider       // LOCAL | GOOGLE
) {}
