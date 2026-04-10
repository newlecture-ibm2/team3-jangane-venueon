package com.venueon.ticket.adapter.out.persistence.repository;

import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Ticket JPA Repository
 */
public interface TicketJpaRepository extends JpaRepository<TicketJpaEntity, Long> {

    List<TicketJpaEntity> findByEventIdOrderBySortOrder(Long eventId);

    List<TicketJpaEntity> findByEventId(Long eventId);
}
