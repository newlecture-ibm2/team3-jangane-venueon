package com.venueon.event.adapter.out.internal;

import com.venueon.event.application.port.out.LoadHostInfoPort;
import com.venueon.user.adapter.out.persistence.entity.HostProfileJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Event 모듈 → User 모듈 연결 어댑터
 * LoadHostInfoPort 구현체로, User/HostProfile JPA 엔티티를 조회하여 HostInfo로 변환
 */
@Component
@RequiredArgsConstructor
public class HostInfoAdapter implements LoadHostInfoPort {

    private final UserJpaRepository userJpaRepository;
    private final HostProfileJpaRepository hostProfileJpaRepository;

    @Override
    public Optional<HostInfo> findByUserId(Long userId) {
        Optional<UserJpaEntity> userOpt = userJpaRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        UserJpaEntity user = userOpt.get();
        Optional<HostProfileJpaEntity> hostProfileOpt = hostProfileJpaRepository.findByUserId(userId);

        return Optional.of(new HostInfo(
                user.getId(),
                user.getNickname(),
                user.getProfileImg(),
                hostProfileOpt.map(HostProfileJpaEntity::getOrgName).orElse(user.getNickname()),
                hostProfileOpt.map(HostProfileJpaEntity::getOrgDescription).orElse(null)
        ));
    }
}
