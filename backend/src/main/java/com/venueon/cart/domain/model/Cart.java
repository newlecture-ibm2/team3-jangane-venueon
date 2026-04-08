package com.venueon.cart.domain.model;

import java.time.LocalDateTime;

/**
 * Cart(장바구니) 도메인 모델 (순수 POJO)
 * Hexagonal Architecture: Domain Layer
 */
public class Cart {

    private Long id;
    private Long userId;
    private Long eventId;
    private String eventTitle;
    private int price;
    private int discountedPrice;
    private int quantity;
    private LocalDateTime startDate;
    private LocalDateTime createdAt;

    protected Cart() {}

    public Cart(Long id, Long userId, Long eventId, String eventTitle,
                int price, int discountedPrice, int quantity,
                LocalDateTime startDate, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.price = price;
        this.discountedPrice = discountedPrice;
        this.quantity = quantity;
        this.startDate = startDate;
        this.createdAt = createdAt;
    }

    /**
     * 새로운 장바구니 항목 생성
     */
    public static Cart create(Long userId, Long eventId, String eventTitle,
                              int price, int discountedPrice, LocalDateTime startDate) {
        return new Cart(null, userId, eventId, eventTitle, price, discountedPrice,
                1, startDate, LocalDateTime.now());
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
     * 소계 계산
     */
    public int getSubtotal() {
        return discountedPrice * quantity;
    }

    /**
     * 할인 금액 계산
     */
    public int getDiscountAmount() {
        return (price - discountedPrice) * quantity;
    }

    /**
     * 사용자 소유 확인
     */
    public boolean isOwnedBy(Long userId) {
        return this.userId != null && this.userId.equals(userId);
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getEventId() { return eventId; }
    public String getEventTitle() { return eventTitle; }
    public int getPrice() { return price; }
    public int getDiscountedPrice() { return discountedPrice; }
    public int getQuantity() { return quantity; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
