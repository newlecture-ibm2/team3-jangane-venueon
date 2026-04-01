package com.venueon.user.application.port.in;

import com.venueon.user.domain.model.User;

/**
 * 사용자 정보 조회 유스케이스 (Port-In)
 */
public interface GetUserInfoUseCase {

    User getUserByEmail(String email);
}
