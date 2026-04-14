package com.venueon.badge.adapter.out.persistence;

import com.venueon.badge.domain.model.Badge;
import com.venueon.badge.adapter.out.persistence.entity.BadgeJpaEntity;

/**
 * Badge JPA ↔ Domain 변환 매퍼
 */
public class BadgeMapper {

    private BadgeMapper() {}

    public static Badge toDomain(BadgeJpaEntity entity) {
        return new Badge(
                entity.getId(),
                entity.getUser().getId(),
                entity.getEvent() != null ? entity.getEvent().getId() : null,
                entity.getBadgeName(),
                entity.getBadgeImageUrl(),
                entity.isVisible(),
                entity.getEarnedAt()
        );
    }
}
