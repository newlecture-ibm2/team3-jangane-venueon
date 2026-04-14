package com.venueon.order.domain.model;

import java.time.LocalDateTime;

/**
 * Order(참가 신청) 도메인 모델 (순수 POJO)
 *
 * v6: sessionId → ticketId 전환
 */
public class Order {

    private Long id;
    private Long userId;
    private Long eventId;
    private Long ticketId;
    private OrderStatus status;
    private int quantity;
    private int amount;
    private String paymentMethod;
    private String tossPaymentKey;
    private String tossOrderId;
    private LocalDateTime orderedAt;
    private LocalDateTime paidAt;

    protected Order() {}

    public Order(Long id, Long userId, Long eventId, Long ticketId, OrderStatus status,
                 int quantity, int amount, String paymentMethod,
                 String tossPaymentKey, String tossOrderId,
                 LocalDateTime orderedAt, LocalDateTime paidAt) {
        this.id = id;
        this.userId = userId;
        this.eventId = eventId;
        this.ticketId = ticketId;
        this.status = status;
        this.quantity = quantity;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.tossPaymentKey = tossPaymentKey;
        this.tossOrderId = tossOrderId;
        this.orderedAt = orderedAt;
        this.paidAt = paidAt;
    }

    public static Order createPending(Long userId, Long eventId, Long ticketId, int quantity, int amount, String paymentMethod) {
        OrderStatus initialStatus = (amount == 0) ? OrderStatus.REGISTERED : OrderStatus.PENDING;
        return new Order(null, userId, eventId, ticketId, initialStatus, quantity, amount, paymentMethod, null, null, LocalDateTime.now(), null);
    }

    // --- 비즈니스 행위 ---

    public void updateTossOrderId(String tossOrderId) {
        this.tossOrderId = tossOrderId;
    }

    public void confirmPayment(String tossPaymentKey) {
        this.status = OrderStatus.PAID;
        this.tossPaymentKey = tossPaymentKey;
        this.paidAt = LocalDateTime.now();
    }

    public void cancel() {
        if (this.status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void refund() {
        if (this.status != OrderStatus.PAID && this.status != OrderStatus.REGISTERED) {
            throw new IllegalStateException("결제 완료 혹는 등록 완료 상태에서만 취소/환불 가능합니다.");
        }
        // 0원 티켓(REGISTERED)은 환불금액이 없으므로 '취소'와 동일하게 취급되지만 통계 목적으로 REFUNDED 상태를 사용합니다
        this.status = OrderStatus.REFUNDED;
    }

    public void requestRefund() {
        if (!isCancellable()) {
            throw new IllegalStateException("환불 불가능한 상태입니다.");
        }
        this.status = OrderStatus.REFUND_REQUESTED;
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
    public Long getTicketId() { return ticketId; }
    public OrderStatus getStatus() { return status; }
    public int getQuantity() { return quantity; }
    public int getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getTossPaymentKey() { return tossPaymentKey; }
    public String getTossOrderId() { return tossOrderId; }
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public LocalDateTime getPaidAt() { return paidAt; }
}
