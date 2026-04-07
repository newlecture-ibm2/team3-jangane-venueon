package com.venueon.order.adapter.out.persistence.entity;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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

    @CreationTimestamp
    @Column(name = "ordered_at", nullable = false, updatable = false)
    private LocalDateTime orderedAt;

    @Column(name = "display_ordered_at")
    private LocalDateTime displayOrderedAt;
}
