package com.venueon.admin.user.adapter.out.persistence;

import com.venueon.admin.user.application.port.out.AdminUserRepositoryPort;
import com.venueon.user.adapter.out.persistence.UserMapper;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.UserRole;
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
    private final UserMapper userMapper;

    @Override
    public Page<User> findUsers(String keyword, UserRole role, Boolean active, Pageable pageable) {
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        String safeKeyword = hasKeyword ? keyword.toLowerCase() : "";

        boolean hasRole = role != null;
        UserRole safeRole = hasRole ? role : UserRole.USER;

        boolean hasActive = active != null;
        Boolean safeActive = hasActive ? active : false;

        return userJpaRepository.findUsersDynamically(safeKeyword, hasKeyword, safeRole, hasRole, safeActive, hasActive, pageable)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id)
                .map(userMapper::toDomain);
    }

    @Override
    public User save(User user) {
        UserJpaEntity entity = userMapper.toEntity(user);
        UserJpaEntity saved = userJpaRepository.save(entity);
        return userMapper.toDomain(saved);
    }

    @Override
    public boolean existsById(Long id) {
        return userJpaRepository.existsById(id);
    }

    @Override
    public void deleteById(Long id) {
        userJpaRepository.deleteById(id);
    }
}
