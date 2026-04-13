package com.venueon.ticket.adapter.out.persistence;

import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionJpaEntity;
import com.venueon.ticket.domain.model.Ticket;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Ticket Domain ↔ JPA Entity 변환
 */
@Component
public class TicketMapper {

    public Ticket toDomain(TicketJpaEntity entity) {
        if (entity == null) return null;

        List<Long> sessionIds = entity.getTicketSessions().stream()
                .map(ts -> ts.getSession().getId())
                .collect(Collectors.toList());

        return new Ticket(
                entity.getId(),
                entity.getEvent().getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getOriginalPrice(),
                entity.getMaxQuantity(),
                entity.getSoldCount(),
                entity.isAllSessions(),
                entity.getSortOrder(),
                entity.isActive(),
                entity.getSalesStart(),
                entity.getSalesEnd(),
                sessionIds,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
