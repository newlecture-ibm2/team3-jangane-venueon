package com.venueon.user.adapter.out.persistence;

import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * UserRepositoryPort 구현체 — JPA 연동
 */
@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository categoryJpaRepository;
    private final UserMapper userMapper;

    @Override
    public User save(User user) {
        UserJpaEntity entity;
        if (user.getId() != null) {
            entity = userJpaRepository.findWithCategoriesById(user.getId()).orElse(userMapper.toEntity(user));
            entity.updateProfile(user.getNickname(), user.getProfileImg());
            entity.updateBadgeVisibility(user.isBadgeVisible());
            if (!user.isActive()) {
                entity.softDelete();
            }
        } else {
            entity = userMapper.toEntity(user);
        }

        // 카테고리 업데이트
        if (user.getCategories() != null) {
            List<com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity> categoryEntities = 
                user.getCategories().stream()
                    .map(name -> categoryJpaRepository.findByName(name).orElse(null))
                    .filter(c -> c != null)
                    .collect(Collectors.toList());
            entity.updateCategories(categoryEntities);
        } else {
            entity.updateCategories(new java.util.ArrayList<>());
        }

        UserJpaEntity saved = userJpaRepository.save(entity);
        return userMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
                .map(userMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }
}
