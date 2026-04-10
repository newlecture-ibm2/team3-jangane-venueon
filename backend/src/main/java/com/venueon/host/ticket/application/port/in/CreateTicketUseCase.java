package com.venueon.host.ticket.application.port.in;

import com.venueon.ticket.domain.model.Ticket;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 생성 UseCase (호스트)
 */
public interface CreateTicketUseCase {

    Ticket createTicket(CreateTicketCommand command);

    record CreateTicketCommand(
            Long eventId,
            Long hostId,
            String name,
            String description,
            int price,
            int originalPrice,
            Integer maxQuantity,
            boolean isAllSessions,
            List<Long> sessionIds,
            int sortOrder,
            LocalDateTime salesStart,
            LocalDateTime salesEnd
    ) {}
}
