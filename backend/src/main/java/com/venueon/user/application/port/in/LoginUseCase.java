package com.venueon.user.application.port.in;

/**
 * 로그인 유스케이스 (Port-In)
 */
public interface LoginUseCase {

    /**
     * 로그인 결과 DTO (Service → Controller 전달용)
     */
    record LoginResult(String token, String email, String nickname, com.venueon.common.dto.CodeDto role, boolean tempPassword) {}

    LoginResult login(String email, String password);
}
