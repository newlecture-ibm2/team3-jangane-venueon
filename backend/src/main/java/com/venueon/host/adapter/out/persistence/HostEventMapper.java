package com.venueon.host.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.host.dto.HostEventResponse;
import org.springframework.stereotype.Component;

/**
 * EventJpaEntity → HostEventResponse DTO 변환
 */
@Component
public class HostEventMapper {

    public HostEventResponse toResponse(EventJpaEntity entity) {
        return new HostEventResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getThumbnailUrl(),
                entity.getType().name(),
                entity.getStatus().name(),
                entity.getPrice(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getMaxAttendees(),
                entity.getLocation(),
                entity.isOnline(),
                entity.getCreatedAt()
        );
    }
}
