package com.venueon.host.profile.application.port.in;

import com.venueon.host.profile.adapter.in.web.dto.HostProfileResponse;
import com.venueon.host.profile.adapter.in.web.dto.UpdateHostProfileRequest;

/**
 * 호스트 프로필 수정 유스케이스 (Port-In)
 */
public interface UpdateHostProfileUseCase {

    /**
     * userId 기반으로 호스트 프로필 수정
     */
    HostProfileResponse updateHostProfile(Long userId, UpdateHostProfileRequest request);
}
