package com.venueon.ticket.adapter.out.persistence.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * TicketSession 복합 키 클래스
 */
public class TicketSessionId implements Serializable {

    private Long ticket;
    private Long session;

    public TicketSessionId() {}

    public TicketSessionId(Long ticket, Long session) {
        this.ticket = ticket;
        this.session = session;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TicketSessionId that = (TicketSessionId) o;
        return Objects.equals(ticket, that.ticket) && Objects.equals(session, that.session);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ticket, session);
    }
}
