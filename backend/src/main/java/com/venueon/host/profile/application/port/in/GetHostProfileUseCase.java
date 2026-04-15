package com.venueon.host.profile.application.port.in;

import com.venueon.host.profile.adapter.in.web.dto.HostProfileResponse;

/**
 * 호스트 프로필 조회 유스케이스 (Port-In)
 */
public interface GetHostProfileUseCase {

    /**
     * userId 기반으로 호스트 프로필 조회
     */
    HostProfileResponse getHostProfile(Long userId);
}
