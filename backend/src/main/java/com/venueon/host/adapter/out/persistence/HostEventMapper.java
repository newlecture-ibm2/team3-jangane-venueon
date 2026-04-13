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
                0, // price (Phase 3에서 Ticket 단위로 관리)
                null, // startDate (요구사항 변경 시 Session 기반으로 처리)
                null, // endDate
                0, // maxAttendees
                "-", // location
                false, // isOnline
                entity.getCreatedAt()
        );
    }
}
