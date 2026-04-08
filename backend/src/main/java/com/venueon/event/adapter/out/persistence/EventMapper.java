package com.venueon.event.adapter.out.persistence;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * EventJpaEntity ↔ Event 도메인 모델 변환
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
                entity.getType(),
                entity.getStatus(),
                entity.getLocation(),
                entity.isOnline(),
                entity.getPrice(),
                entity.getMaxAttendees(),
                entity.getThumbnailUrl(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    /**
     * 도메인 모델 → JPA Entity (생성 시)
     */
    public EventJpaEntity toEntity(Event domain) {
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
                .type(domain.getType())
                .status(domain.getStatus())
                .location(domain.getLocation())
                .isOnline(domain.getIsOnline())
                .price(domain.getPrice())
                .maxAttendees(domain.getMaxAttendees())
                .thumbnailUrl(domain.getThumbnailUrl())
                .startDate(domain.getStartDate())
                .endDate(domain.getEndDate())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}

