package com.venueon.user.adapter.out.persistence;

import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.domain.model.User;
import org.springframework.stereotype.Component;

/**
 * UserJpaEntity ↔ User 도메인 모델 변환
 */
@Component
public class UserMapper {

    /**
     * 도메인 모델 → JPA Entity
     */
    public UserJpaEntity toEntity(User user, com.venueon.user.adapter.out.persistence.entity.UserRoleJpaEntity roleEntity) {
        return UserJpaEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword())
                .nickname(user.getNickname())
                .role(roleEntity)
                .provider(user.getProvider())
                .profileImg(user.getProfileImg())
                .phone(user.getPhone())
                .isActive(user.isActive())
                .isBadgeVisible(user.isBadgeVisible())
                .build();
    }

    /**
     * JPA Entity → 도메인 모델
     */
    public User toDomain(UserJpaEntity entity) {
        return new User(
                entity.getId(),
                entity.getEmail(),
                entity.getPassword(),
                entity.getNickname(),
                entity.getRole() != null ? com.venueon.common.model.DomainCode.of(entity.getRole().getId(), entity.getRole().getName()) : null,
                entity.getProvider(),
                entity.getProfileImg(),
                entity.getPhone(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCategories() != null ? entity.getCategories().stream().map(c -> c.getName()).collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>(),
                entity.isBadgeVisible()
        );
    }
}
