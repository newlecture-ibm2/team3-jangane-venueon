package com.venueon.host.ticket.application.port.in;

import com.venueon.ticket.domain.model.Ticket;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 수정 UseCase (호스트)
 */
public interface UpdateTicketUseCase {

    Ticket updateTicket(UpdateTicketCommand command);

    record UpdateTicketCommand(
            Long ticketId,
            Long hostId,
            String name,
            String description,
            int price,
            int originalPrice,
            Integer maxQuantity,
            boolean isAllSessions,
            List<Long> sessionIds,
            int sortOrder,
            boolean isActive,
            LocalDateTime salesStart,
            LocalDateTime salesEnd
    ) {}
}
