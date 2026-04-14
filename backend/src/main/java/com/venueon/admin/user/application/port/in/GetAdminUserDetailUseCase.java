package com.venueon.admin.user.application.port.in;

import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.HostProfile;

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

    /**
     * ID로 호스트 프로필 정보 조회
     *
     * @param userId 회원 ID
     * @return 호스트 프로필 도메인 모델 (없으면 null)
     */
    HostProfile getHostProfileByUserId(Long userId);
}
