package com.venueon.admin.user.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * 회원 활성/비활성 전환 요청 DTO
 */
public record AdminChangeUserStatusRequest(
        @NotNull(message = "활성 상태(active)는 필수입니다.")
        Boolean active
) {
}
