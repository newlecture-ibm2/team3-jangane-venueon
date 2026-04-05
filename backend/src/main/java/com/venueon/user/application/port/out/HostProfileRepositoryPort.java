package com.venueon.user.application.port.out;

import com.venueon.user.domain.model.HostProfile;

import java.util.Optional;

/**
 * 호스트 프로필 저장/조회 인터페이스 (Port-Out)
 */
public interface HostProfileRepositoryPort {

    HostProfile save(HostProfile hostProfile);

    Optional<HostProfile> findByUserId(Long userId);
}
