package com.venueon.ticket.adapter.out.persistence.repository;

import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionId;
import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * TicketSession JPA Repository
 */
public interface TicketSessionJpaRepository extends JpaRepository<TicketSessionJpaEntity, TicketSessionId> {

    List<TicketSessionJpaEntity> findByTicketId(Long ticketId);

    void deleteByTicketId(Long ticketId);
}
