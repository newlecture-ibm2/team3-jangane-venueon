package com.venueon.admin.user.adapter.in.web.dto.request;

/**
 * 회원 정보 수정 요청 DTO
 * - null인 필드는 수정하지 않음 (부분 수정 지원)
 */
public record AdminUpdateUserRequest(
        String nickname,
        Long roleId,
        String phone
) {
}
