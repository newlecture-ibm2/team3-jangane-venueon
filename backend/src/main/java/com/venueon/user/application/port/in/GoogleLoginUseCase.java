package com.venueon.user.application.port.in;

/**
 * 구글 소셜 로그인 유스케이스 (Port-In)
 * Google ID Token을 검증하고 JWT를 발급한다.
 */
public interface GoogleLoginUseCase {

    /**
     * 구글 ID Token으로 로그인/회원가입 처리
     * - 기존 회원이면 JWT 발급
     * - 신규 회원이면 자동 가입 후 JWT 발급
     *
     * @param idTokenString 프론트엔드에서 전달받은 Google ID Token
     * @return LoginResult (JWT + 사용자 정보)
     */
    LoginUseCase.LoginResult googleLogin(String idTokenString);
}
