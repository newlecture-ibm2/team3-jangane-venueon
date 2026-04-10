package com.venueon.ticket.application.port.in;

import com.venueon.ticket.domain.model.Ticket;

import java.util.List;

/**
 * 티켓 조회 UseCase (공개 조회)
 */
public interface GetTicketUseCase {

    List<Ticket> getTicketsByEventId(Long eventId);

    Ticket getTicketById(Long ticketId);
}
