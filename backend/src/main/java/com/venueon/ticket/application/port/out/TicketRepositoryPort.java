package com.venueon.ticket.application.port.out;

import com.venueon.ticket.domain.model.Ticket;

import java.util.List;
import java.util.Optional;

/**
 * Ticket 영속성 포트 (Output Port)
 */
public interface TicketRepositoryPort {

    Ticket save(Ticket ticket, Long eventId, List<Long> sessionIds);

    Optional<Ticket> findById(Long id);

    List<Ticket> findByEventId(Long eventId);

    void deleteById(Long id);

    void updateSoldCount(Long ticketId, int soldCount);
}
