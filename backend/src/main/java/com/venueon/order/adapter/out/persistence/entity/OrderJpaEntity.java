package com.venueon.order.adapter.out.persistence.entity;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Order JPA Entity
 *
 * v6: session_id FK → ticket_id FK 전환. event_id FK 유지.
 */
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private EventJpaEntity event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private TicketJpaEntity ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    @Builder.Default
    private int amount = 0;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "toss_payment_key")
    private String tossPaymentKey;

    @Column(name = "toss_order_id")
    private String tossOrderId;

    @CreationTimestamp
    @Column(name = "ordered_at", nullable = false, updatable = false)
    private LocalDateTime orderedAt;

    @Column(name = "display_ordered_at")
    private LocalDateTime displayOrderedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // --- 상태 변경 메서드 ---

    public void confirmPayment(String tossPaymentKey) {
        this.status = OrderStatus.PAID;
        this.tossPaymentKey = tossPaymentKey;
        this.paidAt = LocalDateTime.now();
    }

    public void updateTossOrderId(String tossOrderId) {
        this.tossOrderId = tossOrderId;
    }

    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
    }

    public TicketJpaEntity getTicket() {
        return ticket;
    }
}
