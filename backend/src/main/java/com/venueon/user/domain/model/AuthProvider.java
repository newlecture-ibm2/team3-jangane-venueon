package com.venueon.user.domain.model;

/**
 * 인증 제공자 구분
 * - LOCAL: 이메일/비밀번호 회원가입
 * - GOOGLE: 구글 소셜 로그인
 */
public enum AuthProvider {
    LOCAL, GOOGLE
}
