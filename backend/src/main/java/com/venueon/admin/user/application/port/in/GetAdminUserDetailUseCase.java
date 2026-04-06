package com.venueon.admin.user.application.port.in;

import com.venueon.user.domain.model.User;

/**
 * 관리자용 회원 상세 조회 UseCase
 */
public interface GetAdminUserDetailUseCase {

    /**
     * ID로 회원 상세 정보 조회
     *
     * @param id 회원 ID
     * @return 회원 도메인 모델
     */
    User getUserById(Long id);
}
