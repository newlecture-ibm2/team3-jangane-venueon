package com.venueon.user.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 구글 소셜 로그인 요청 DTO
 * 프론트엔드에서 받은 Google ID Token을 전달
 */
public record GoogleLoginRequest(
        @NotBlank(message = "Google ID Token은 필수입니다.")
        String idToken
) {}
