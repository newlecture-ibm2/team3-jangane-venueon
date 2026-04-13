package com.venueon.host.ticket.application.port.in;

/**
 * 티켓 삭제 UseCase (호스트)
 */
public interface DeleteTicketUseCase {

    void deleteTicket(Long ticketId, Long hostId, String hostRole);
}
