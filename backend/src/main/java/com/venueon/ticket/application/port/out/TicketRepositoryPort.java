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

    /**
     * 여러 이벤트 ID로 티켓 벌크 조회
     * 이벤트 목록 API에서 가격 정보 표시용 (N+1 방지)
     */
    List<Ticket> findByEventIds(List<Long> eventIds);

    void deleteById(Long id);

    void updateSoldCount(Long ticketId, int soldCount);
}
