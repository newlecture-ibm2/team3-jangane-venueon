package com.venueon.user.application.port.in;

import com.venueon.user.domain.model.User;

/**
 * 호스트 회원가입 유스케이스 (Port-In)
 */
public interface HostSignUpUseCase {

    User hostSignUp(String email, String password, String managerName,
                    String orgName, String orgNumber, String orgDescription);
}
