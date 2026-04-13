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
                entity.getType() != null ? com.venueon.common.dto.CodeDto.of(entity.getType().getId(), entity.getType().getName()) : null,
                entity.getStatus() != null ? com.venueon.common.dto.CodeDto.of(entity.getStatus().getId(), entity.getStatus().getLabel()) : null,
                entity.isHasSession(),
                entity.getDescription(),
                entity.getCreatedAt()
        );
    }
}
