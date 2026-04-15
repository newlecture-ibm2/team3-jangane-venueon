package com.venueon.host.profile.application.service;

import com.venueon.host.profile.adapter.in.web.dto.HostProfileResponse;
import com.venueon.host.profile.adapter.in.web.dto.UpdateHostProfileRequest;
import com.venueon.host.profile.application.port.in.GetHostProfileUseCase;
import com.venueon.host.profile.application.port.in.UpdateHostProfileUseCase;
import com.venueon.user.application.port.out.HostProfileRepositoryPort;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.HostProfile;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 호스트 프로필 조회/수정 서비스
 * 기존 user 패키지의 HostProfileRepositoryPort, UserRepositoryPort를 재사용하여
 * 공통 코드 수정 없이 독립적으로 동작한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HostProfileService implements GetHostProfileUseCase, UpdateHostProfileUseCase {

    private final HostProfileRepositoryPort hostProfileRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional
    public HostProfileResponse getHostProfile(Long userId) {
        log.debug("호스트 프로필 조회 — userId={}", userId);

        // User에서 profileImg 조회
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "사용자를 찾을 수 없습니다. userId=" + userId));

        // 프로필이 없으면 기본 프로필 자동 생성
        HostProfile profile = hostProfileRepositoryPort.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("호스트 프로필이 없어 기본 프로필을 자동 생성합니다. userId={}", userId);
                    HostProfile defaultProfile = new HostProfile(
                            null, userId, user.getNickname(), "",
                            user.getNickname(), "",
                            java.time.LocalDateTime.now(), java.time.LocalDateTime.now()
                    );
                    return hostProfileRepositoryPort.save(defaultProfile);
                });

        return HostProfileResponse.from(profile, user.getProfileImg());
    }

    @Override
    @Transactional
    public HostProfileResponse updateHostProfile(Long userId, UpdateHostProfileRequest request) {
        log.debug("호스트 프로필 수정 — userId={}, orgName={}", userId, request.getOrgName());

        HostProfile profile = hostProfileRepositoryPort.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "호스트 프로필을 찾을 수 없습니다. userId=" + userId));

        // 도메인 모델의 비즈니스 메서드를 통해 수정
        profile.updateProfile(
                request.getOrgName(),
                request.getOrgDescription(),
                request.getManagerName()
        );

        // 변경된 도메인 모델을 저장
        HostProfile saved = hostProfileRepositoryPort.save(profile);

        // profileImg가 전달된 경우 User 엔티티도 업데이트
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "사용자를 찾을 수 없습니다. userId=" + userId));

        if (request.getProfileImg() != null) {
            user.updateProfile(user.getNickname(), request.getProfileImg(), user.getCategories(), null);
            userRepositoryPort.save(user);
        }

        return HostProfileResponse.from(saved, user.getProfileImg());
    }
}

