package com.venueon.host.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.host.event.adapter.in.web.dto.HostEventResponse;
import com.venueon.host.event.adapter.in.web.dto.HostEventDetailResponse;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Collections;

/**
 * EventJpaEntity → HostEventResponse/HostEventDetailResponse DTO 변환
 */
@Component
public class HostEventMapper {

    public HostEventResponse toResponse(
            EventJpaEntity entity,
            List<com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity> sessions,
            List<com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity> tickets,
            com.venueon.common.model.DomainCode effectiveStatus,
            com.venueon.common.model.DomainCode recruitmentStatus
    ) {
        var firstSession = sessions != null && !sessions.isEmpty() ? sessions.get(0) : null;
        
        // 티켓 기반 가격 정보 계산
        Long finalMinPrice = 0L;
        Long maxPrice = 0L;
        Long originalPrice = 0L;
        boolean hasDiscount = false;

        if (tickets != null && !tickets.isEmpty()) {
            var activeTickets = tickets.stream().filter(t -> t.isActive()).toList();
            if (!activeTickets.isEmpty()) {
                finalMinPrice = activeTickets.stream().mapToLong(t -> (long) t.getPrice()).min().orElse(0L);
                maxPrice = activeTickets.stream().mapToLong(t -> (long) t.getPrice()).max().orElse(0L);
                
                final Long currentMin = finalMinPrice;
                var minTicket = activeTickets.stream()
                        .filter(t -> (long) t.getPrice() == currentMin)
                        .findFirst()
                        .orElse(null);
                
                if (minTicket != null && minTicket.getOriginalPrice() > minTicket.getPrice()) {
                    originalPrice = (long) minTicket.getOriginalPrice();
                    hasDiscount = true;
                }
            }
        }

        return new HostEventResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getThumbnailUrl(),
                entity.getType() != null ? com.venueon.common.dto.CodeDto.of(entity.getType().getId(), entity.getType().getName()) : null,
                effectiveStatus != null ? com.venueon.common.dto.CodeDto.of(effectiveStatus.id(), effectiveStatus.label()) : null,
                recruitmentStatus != null ? com.venueon.common.dto.CodeDto.of(recruitmentStatus.id(), recruitmentStatus.label()) : null,
                entity.isHasSession(),
                entity.getDescription(),
                entity.getCreatedAt(),
                finalMinPrice,
                originalPrice,
                hasDiscount,
                maxPrice,
                firstSession != null ? firstSession.getStartTime() : entity.getCreatedAt(),
                firstSession != null ? firstSession.getEndTime() : entity.getCreatedAt().plusHours(2),
                firstSession != null ? firstSession.getLocation() : "장소 미정",
                entity.getCreator() != null ? entity.getCreator().getNickname() : "알 수 없는 호스트"
        );
    }

    public HostEventDetailResponse toDetailResponse(EventJpaEntity entity, List<com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity> sessions, Long totalRevenue, Long totalAttendees) {
        return new HostEventDetailResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getThumbnailUrl(),
                entity.getCategory() != null ? com.venueon.common.dto.CodeDto.of(entity.getCategory().getId(), entity.getCategory().getName()) : null,
                entity.getStatus() != null ? com.venueon.common.dto.CodeDto.of(entity.getStatus().getId(), entity.getStatus().getLabel()) : null,
                entity.getCreatedAt(),
                totalRevenue,
                totalAttendees,
                sessions != null ? sessions.stream().map(this::toSessionDetail).toList() : Collections.emptyList()
        );
    }

    private HostEventDetailResponse.SessionDetail toSessionDetail(com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity session) {
        return new HostEventDetailResponse.SessionDetail(
                session.getId(),
                session.getTitle(),
                session.getStartTime(),
                session.getEndTime(),
                session.getLocation(),
                session.getMaxAttendees(),
                session.getCurrentAttendees(),
                session.getForcedSessionStatus() != null ? com.venueon.common.dto.CodeDto.of(session.getForcedSessionStatus().getId(), session.getForcedSessionStatus().getLabel()) : null
        );
    }
}
