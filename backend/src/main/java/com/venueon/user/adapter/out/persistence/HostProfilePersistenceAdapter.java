package com.venueon.user.adapter.out.persistence;

import com.venueon.user.adapter.out.persistence.entity.HostProfileJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.user.application.port.out.HostProfileRepositoryPort;
import com.venueon.user.domain.model.HostProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * HostProfileRepositoryPort 구현체 — JPA 연동
 */
@Component
@RequiredArgsConstructor
public class HostProfilePersistenceAdapter implements HostProfileRepositoryPort {

    private final HostProfileJpaRepository hostProfileJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public HostProfile save(HostProfile hostProfile) {
        UserJpaEntity userEntity = userJpaRepository.findById(hostProfile.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + hostProfile.getUserId()));

        HostProfileJpaEntity entity = HostProfileJpaEntity.builder()
                .id(hostProfile.getId())
                .user(userEntity)
                .orgName(hostProfile.getOrgName())
                .orgNumber(hostProfile.getOrgNumber())
                .managerName(hostProfile.getManagerName())
                .orgDescription(hostProfile.getOrgDescription())
                .build();

        HostProfileJpaEntity saved = hostProfileJpaRepository.save(entity);

        return toDomain(saved);
    }

    @Override
    public Optional<HostProfile> findByUserId(Long userId) {
        return hostProfileJpaRepository.findByUserId(userId)
                .map(this::toDomain);
    }

    private HostProfile toDomain(HostProfileJpaEntity entity) {
        return new HostProfile(
                entity.getId(),
                entity.getUser().getId(),
                entity.getOrgName(),
                entity.getOrgNumber(),
                entity.getManagerName(),
                entity.getOrgDescription(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
