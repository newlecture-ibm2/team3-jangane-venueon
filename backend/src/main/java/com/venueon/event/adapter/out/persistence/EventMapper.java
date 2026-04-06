package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import org.springframework.stereotype.Component;

/**
 * EventJpaEntity ↔ Event 도메인 모델 변환
 */
@Component
public class EventMapper {

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
}
