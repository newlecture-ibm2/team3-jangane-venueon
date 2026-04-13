package com.venueon.cart.adapter.out.persistence.entity;

import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Cart JPA Entity
 * Hexagonal Architecture: Adapter Layer (Persistence)
 *
 * v6: event_session_id FK → ticket_id FK 전환
 */
@Entity
@Table(name = "cart")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CartJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private TicketJpaEntity ticket;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수량 변경 메서드
    public void updateQuantity(int quantity) {
        this.quantity = quantity;
    }
}
