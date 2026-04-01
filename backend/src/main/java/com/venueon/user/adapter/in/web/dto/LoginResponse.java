package com.venueon.user.adapter.in.web.dto;

/**
 * 로그인 응답 DTO (token, email, nickname, role)
 */
public record LoginResponse(
        String token,
        String email,
        String nickname,
        String role
) {}
