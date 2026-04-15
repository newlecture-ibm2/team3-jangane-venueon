package com.venueon.admin.user.adapter.out.persistence;

import com.venueon.admin.user.application.port.out.AdminUserRepositoryPort;
import com.venueon.user.adapter.out.persistence.UserMapper;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserRoleJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.UserRoleJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository;
import com.venueon.user.domain.model.HostProfile;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * AdminUserRepositoryPort 구현체
 * - 기존 UserJpaRepository + UserMapper를 재사용 (Entity 중복 생성 ✕)
 * - Domain ↔ Entity 변환은 UserMapper에 위임
 */
@Component
@RequiredArgsConstructor
public class AdminUserPersistenceAdapter implements AdminUserRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final UserRoleJpaRepository userRoleJpaRepository;
    private final HostProfileJpaRepository hostProfileJpaRepository;
    private final UserMapper userMapper;

    @Override
    public Page<User> findUsers(String keyword, String role, Boolean active, Pageable pageable) {
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        String safeKeyword = hasKeyword ? keyword.toLowerCase() : "";

        boolean hasRole = role != null;
        Long safeRoleId = null;
        if (hasRole) {
            try {
                safeRoleId = Long.parseLong(role);
            } catch (NumberFormatException e) {
                // role이 문자열("ADMIN" 등)으로 들어온 경우 무시 (필터 미적용)
                hasRole = false;
            }
        }

        boolean hasActive = active != null;
        Boolean safeActive = hasActive ? active : false;

        return userJpaRepository.findUsersDynamically(safeKeyword, hasKeyword, safeRoleId, hasRole, safeActive, hasActive, pageable)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id)
                .map(userMapper::toDomain);
    }

    @Override
    public User save(User user) {
        UserRoleJpaEntity roleEntity = user.getRole() != null ? userRoleJpaRepository.findById(user.getRole().id()).orElse(null) : null;
        UserJpaEntity entity = userMapper.toEntity(user, roleEntity);
        UserJpaEntity saved = userJpaRepository.save(entity);
        return userMapper.toDomain(saved);
    }

    @Override
    public boolean existsById(Long id) {
        return userJpaRepository.existsById(id);
    }

    @Override
    public Optional<HostProfile> findHostProfileByUserId(Long userId) {
        return hostProfileJpaRepository.findByUserId(userId)
                .map(entity -> new HostProfile(
                        entity.getId(),
                        entity.getUser().getId(),
                        entity.getOrgName(),
                        entity.getOrgNumber(),
                        entity.getManagerName(),
                        entity.getOrgDescription(),
                        entity.getCreatedAt(),
                        entity.getUpdatedAt()
                ));
    }

    @Override
    public void deleteById(Long id) {
        userJpaRepository.deleteById(id);
    }

    @Override
    public long countByRoleId(Long roleId) {
        return userJpaRepository.countByRoleId(roleId);
    }

    @Override
    public long countByRoleIdAndCreatedAtAfter(Long roleId, java.time.LocalDateTime dateTime) {
        return userJpaRepository.countByRoleIdAndCreatedAtAfter(roleId, dateTime);
    }
}
