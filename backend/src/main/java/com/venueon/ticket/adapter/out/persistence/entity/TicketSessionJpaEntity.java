package com.venueon.ticket.adapter.out.persistence.entity;

import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * TicketSession 매핑 테이블 — ticket_sessions
 * Ticket과 Session 간 N:N 관계
 */
@Entity
@Table(name = "ticket_sessions")
@IdClass(TicketSessionId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TicketSessionJpaEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private TicketJpaEntity ticket;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private SessionJpaEntity session;
}
