package com.venueon.ticket.application.port.in;

import com.venueon.ticket.domain.model.Ticket;

import java.util.List;

/**
 * 티켓 조회 UseCase (공개 조회)
 */
public interface GetTicketUseCase {

    List<Ticket> getTicketsByEventId(Long eventId);

    Ticket getTicketById(Long ticketId);

    /**
     * 여러 이벤트 ID로 티켓 벌크 조회
     * 이벤트 목록 API에서 가격 정보 표시용 (N+1 방지)
     */
    List<Ticket> getTicketsByEventIds(List<Long> eventIds);
}
