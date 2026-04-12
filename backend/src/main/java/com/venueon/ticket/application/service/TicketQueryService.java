package com.venueon.ticket.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.Session;
import com.venueon.ticket.adapter.in.web.dto.TicketResponse;
import com.venueon.ticket.application.port.in.GetTicketUseCase;
import com.venueon.ticket.application.port.out.TicketRepositoryPort;
import com.venueon.ticket.domain.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 티켓 조회 서비스 (Query 전용)
 * 정원연동: 연결된 세션 정보를 조회하여 isPurchasable, unavailableReason 계산
 */
@UseCase
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketQueryService implements GetTicketUseCase {

    private final TicketRepositoryPort ticketRepositoryPort;
    private final SessionPort sessionPort;

    @Override
    public List<Ticket> getTicketsByEventId(Long eventId) {
        return ticketRepositoryPort.findByEventId(eventId);
    }

    @Override
    public Ticket getTicketById(Long ticketId) {
        return ticketRepositoryPort.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + ticketId));
    }

    /**
     * 정원 연동 포함된 티켓 목록 조회
     * 각 티켓의 연결된 세션을 조회하여 isPurchasable, unavailableReason, recruitEndDate를 계산
     */
    public List<TicketResponse> getTicketsWithPurchasability(Long eventId) {
        List<Ticket> tickets = ticketRepositoryPort.findByEventId(eventId);

        return tickets.stream()
                .map(ticket -> {
                    List<Session> linkedSessions = getLinkedSessions(ticket, eventId);
                    return TicketResponse.from(ticket, linkedSessions);
                })
                .toList();
    }

    /**
     * 단일 티켓의 정원 연동 응답 조회
     */
    public TicketResponse getTicketWithPurchasability(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        List<Session> linkedSessions = getLinkedSessions(ticket, ticket.getEventId());
        return TicketResponse.from(ticket, linkedSessions);
    }

    /**
     * 티켓에 연결된 세션 목록 조회
     * isAllSessions=true → 이벤트의 모든 세션
     * isAllSessions=false → ticket_sessions 매핑 테이블의 세션
     */
    private List<Session> getLinkedSessions(Ticket ticket, Long eventId) {
        if (ticket.getIsAllSessions()) {
            return sessionPort.findByEventId(eventId);
        } else {
            List<Long> sessionIds = ticket.getSessionIds();
            if (sessionIds == null || sessionIds.isEmpty()) {
                return List.of();
            }
            return sessionPort.findAllByIds(sessionIds);
        }
    }
}

