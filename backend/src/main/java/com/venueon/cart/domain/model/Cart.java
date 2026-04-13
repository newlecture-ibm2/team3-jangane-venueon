package com.venueon.cart.domain.model;

import java.time.LocalDateTime;

/**
 * Cart(장바구니) 도메인 모델 (순수 POJO)
 * Hexagonal Architecture: Domain Layer
 *
 * v6: session 기반 → ticket 기반으로 전환
 */
public class Cart {

    private Long id;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private Long ticketId;
    private String ticketName;
    private int ticketPrice;
    private int ticketOriginalPrice;
    private int quantity;
    private LocalDateTime createdAt;

    protected Cart() {}

    public Cart(Long id, String userEmail, Long eventId, String eventTitle,
                Long ticketId, String ticketName,
                int ticketPrice, int ticketOriginalPrice, int quantity,
                LocalDateTime createdAt) {
        this.id = id;
        this.userEmail = userEmail;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.ticketId = ticketId;
        this.ticketName = ticketName;
        this.ticketPrice = ticketPrice;
        this.ticketOriginalPrice = ticketOriginalPrice;
        this.quantity = quantity;
        this.createdAt = createdAt;
    }

    /**
     * 새로운 장바구니 항목 생성
     */
    public static Cart create(String userEmail, Long eventId, String eventTitle,
                               Long ticketId, String ticketName,
                               int ticketPrice, int ticketOriginalPrice, int quantity) {
        return new Cart(null, userEmail, eventId, eventTitle, ticketId, ticketName,
                ticketPrice, ticketOriginalPrice, quantity, LocalDateTime.now());
    }

    // --- 비즈니스 행위 ---

    /**
     * 수량 변경
     */
    public void updateQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
        }
        this.quantity = quantity;
    }

    /**
     * 소계 계산 (판매가 기준)
     */
    public int getSubtotal() {
        return ticketPrice * quantity;
    }

    /**
     * 할인 금액 계산
     */
    public int getDiscountAmount() {
        return (ticketOriginalPrice - ticketPrice) * quantity;
    }

    /**
     * 할인율 계산 (%)
     */
    public int getDiscountRate() {
        if (ticketOriginalPrice <= 0 || ticketPrice >= ticketOriginalPrice) return 0;
        return (int) Math.round((1.0 - (double) ticketPrice / ticketOriginalPrice) * 100);
    }

    /**
     * 사용자 소유 확인
     */
    public boolean isOwnedBy(String userEmail) {
        return this.userEmail != null && this.userEmail.equals(userEmail);
    }

    // --- Getters ---

    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public Long getEventId() { return eventId; }
    public String getEventTitle() { return eventTitle; }
    public Long getTicketId() { return ticketId; }
    public String getTicketName() { return ticketName; }
    public int getTicketPrice() { return ticketPrice; }
    public int getTicketOriginalPrice() { return ticketOriginalPrice; }
    public int getQuantity() { return quantity; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
