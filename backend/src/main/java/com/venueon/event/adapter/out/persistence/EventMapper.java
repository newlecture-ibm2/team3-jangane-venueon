package com.venueon.event.adapter.out.persistence;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.domain.model.Event;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * EventJpaEntity ↔ Event 도메인 모델 변환
 * v6: price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거
 */
@Component
@RequiredArgsConstructor
public class EventMapper {

    private final EntityManager entityManager;

    /**
     * JPA Entity → 도메인 모델
     */
    public Event toDomain(EventJpaEntity entity) {
        return new Event(
                entity.getId(),
                entity.getCreator() != null ? entity.getCreator().getId() : null,
                entity.getCategory() != null ? entity.getCategory().getId() : null,
                entity.getTitle(),
                entity.getDescription(),
                entity.getDetailContent(),
                entity.getType() != null ? com.venueon.common.model.DomainCode.of(entity.getType().getId(), entity.getType().getName()) : null,
                entity.getStatus() != null ? com.venueon.common.model.DomainCode.of(entity.getStatus().getId(), entity.getStatus().getLabel()) : null,
                entity.getThumbnailUrl(),
                entity.isHasSession(),
                entity.isHidden(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    /**
     * 도메인 모델 → JPA Entity (생성 시)
     */
    public EventJpaEntity toEntity(Event domain, com.venueon.event.adapter.out.persistence.entity.EventTypeJpaEntity typeEntity, com.venueon.event.adapter.out.persistence.entity.EventStatusJpaEntity statusEntity) {
        UserJpaEntity creatorRef = domain.getCreatorId() != null
                ? entityManager.getReference(UserJpaEntity.class, domain.getCreatorId())
                : null;
        CategoryJpaEntity categoryRef = domain.getCategoryId() != null
                ? entityManager.getReference(CategoryJpaEntity.class, domain.getCategoryId())
                : null;

        return EventJpaEntity.builder()
                .id(domain.getId())
                .creator(creatorRef)
                .category(categoryRef)
                .title(domain.getTitle())
                .description(domain.getDescription())
                .detailContent(domain.getDetailContent())
                .type(typeEntity)
                .status(statusEntity)
                .thumbnailUrl(domain.getThumbnailUrl())
                .hasSession(domain.getHasSession())
                .isHidden(domain.getIsHidden())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
