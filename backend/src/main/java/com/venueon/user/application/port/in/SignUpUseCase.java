package com.venueon.user.application.port.in;

import com.venueon.user.domain.model.User;

/**
 * 회원가입 유스케이스 (Port-In)
 */
public interface SignUpUseCase {

    User signUp(String email, String password, String nickname, String role);
}
