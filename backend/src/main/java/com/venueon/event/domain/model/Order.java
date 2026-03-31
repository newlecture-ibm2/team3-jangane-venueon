package com.venueon.event.domain.model;

import java.time.LocalDateTime;

/**
 * Order(참가 신청) 도메인 모델 (순수 POJO)
 */
public class Order {

    private Long id;
    private Long userId;
    private Long eventId;
    private OrderStatus status;
    private int amount;
    private LocalDateTime orderedAt;

    protected Order() {}

    public Order(Long id, Long userId, Long eventId, OrderStatus status,
                 int amount, LocalDateTime orderedAt) {
        this.id = id;
        this.userId = userId;
        this.eventId = eventId;
        this.status = status;
        this.amount = amount;
        this.orderedAt = orderedAt;
    }

    // --- 비즈니스 행위 ---

    public void cancel() {
        if (this.status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void refund() {
        if (this.status != OrderStatus.PAID) {
            throw new IllegalStateException("결제 완료 상태에서만 환불 가능합니다.");
        }
        this.status = OrderStatus.REFUNDED;
    }

    public boolean isCancellable() {
        return this.status == OrderStatus.PAID || this.status == OrderStatus.REGISTERED;
    }

    public boolean isOwnedBy(Long userId) {
        return this.userId != null && this.userId.equals(userId);
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getEventId() { return eventId; }
    public OrderStatus getStatus() { return status; }
    public int getAmount() { return amount; }
    public LocalDateTime getOrderedAt() { return orderedAt; }
}
