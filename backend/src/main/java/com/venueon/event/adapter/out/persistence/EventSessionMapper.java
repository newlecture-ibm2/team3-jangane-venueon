package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.event.domain.model.EventSession;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * EventSessionJpaEntity ↔ EventSession 도메인 모델 변환
 */
@Component
@RequiredArgsConstructor
public class EventSessionMapper {

    private final EntityManager entityManager;

    /**
     * JPA Entity → 도메인 모델
     */
    public EventSession toDomain(EventSessionJpaEntity entity) {
        return new EventSession(
                entity.getId(),
                entity.getEvent() != null ? entity.getEvent().getId() : null,
                entity.getTitle(),
                entity.getDescription(),
                entity.getSortOrder(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getLocation(),
                entity.getRegionSido(),
                entity.getRegionSigungu(),
                entity.isOnline(),
                entity.getOnlineLink(),
                entity.getPrice(),
                entity.getMaxAttendees(),
                entity.getCurrentAttendees(),
                entity.isDefault(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    /**
     * 도메인 모델 → JPA Entity
     */
    public EventSessionJpaEntity toJpaEntity(EventSession domain, EventJpaEntity eventEntity) {
        return EventSessionJpaEntity.builder()
                .id(domain.getId())
                .event(eventEntity)
                .title(domain.getTitle())
                .description(domain.getDescription())
                .sortOrder(domain.getSortOrder())
                .startTime(domain.getStartTime())
                .endTime(domain.getEndTime())
                .location(domain.getLocation())
                .regionSido(domain.getRegionSido())
                .regionSigungu(domain.getRegionSigungu())
                .isOnline(domain.getIsOnline())
                .onlineLink(domain.getOnlineLink())
                .price(domain.getPrice())
                .maxAttendees(domain.getMaxAttendees())
                .currentAttendees(domain.getCurrentAttendees())
                .isDefault(domain.getIsDefault())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    /**
     * 도메인 모델 → JPA Entity (eventId로 참조)
     */
    public EventSessionJpaEntity toJpaEntity(EventSession domain, Long eventId) {
        EventJpaEntity eventRef = entityManager.getReference(EventJpaEntity.class, eventId);
        return toJpaEntity(domain, eventRef);
    }
}
