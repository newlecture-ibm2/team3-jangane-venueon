package com.venueon.ticket.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.ticket.application.port.in.GetTicketUseCase;
import com.venueon.ticket.application.port.out.TicketRepositoryPort;
import com.venueon.ticket.domain.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 티켓 조회 서비스 (Query 전용)
 */
@UseCase
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketQueryService implements GetTicketUseCase {

    private final TicketRepositoryPort ticketRepositoryPort;

    @Override
    public List<Ticket> getTicketsByEventId(Long eventId) {
        return ticketRepositoryPort.findByEventId(eventId);
    }

    @Override
    public Ticket getTicketById(Long ticketId) {
        return ticketRepositoryPort.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + ticketId));
    }
}
