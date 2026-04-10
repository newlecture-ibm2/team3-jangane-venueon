package com.venueon.ticket.domain.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Ticket 도메인 모델 (순수 POJO)
 * 호스트가 자유롭게 구성하는 판매 단위. 하나 이상의 세션에 대한 입장권 역할.
 */
public class Ticket {

    private Long id;
    private Long eventId;
    private String name;            // "전체 패키지", "Day 1 입장권"
    private String description;
    private int price;              // 실제 판매가
    private int originalPrice;      // 정가 (할인 전)
    private Integer maxQuantity;    // NULL = 무제한
    private int soldCount;
    private boolean isAllSessions;
    private int sortOrder;
    private boolean isActive;
    private LocalDateTime salesStart;
    private LocalDateTime salesEnd;
    private List<Long> sessionIds;  // 매핑된 세션 ID 목록
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Ticket() {}

    public Ticket(Long id, Long eventId, String name, String description,
                  int price, int originalPrice, Integer maxQuantity, int soldCount,
                  boolean isAllSessions, int sortOrder, boolean isActive,
                  LocalDateTime salesStart, LocalDateTime salesEnd,
                  List<Long> sessionIds,
                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.eventId = eventId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.maxQuantity = maxQuantity;
        this.soldCount = soldCount;
        this.isAllSessions = isAllSessions;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
        this.salesStart = salesStart;
        this.salesEnd = salesEnd;
        this.sessionIds = sessionIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- 비즈니스 메서드 ---

    /** 현재 판매중인지 확인 (판매 기간 + isActive) */
    public boolean isOnSale() {
        if (!isActive) return false;
        LocalDateTime now = LocalDateTime.now();
        if (salesStart != null && now.isBefore(salesStart)) return false;
        if (salesEnd != null && now.isAfter(salesEnd)) return false;
        return true;
    }

    /** 요청 수량만큼 재고가 있는지 확인 */
    public boolean hasStock(int qty) {
        if (maxQuantity == null) return true; // 무제한
        return (soldCount + qty) <= maxQuantity;
    }

    /** 할인율 계산 (정수 %) */
    public int getDiscountRate() {
        if (originalPrice <= 0) return 0;
        return (int) Math.round((double) (originalPrice - price) / originalPrice * 100);
    }

    /** 잔여 수량 (null = 무제한) */
    public Integer getRemainingQuantity() {
        if (maxQuantity == null) return null;
        return maxQuantity - soldCount;
    }

    /** 판매 수량 증가 */
    public void incrementSoldCount(int qty) {
        if (!hasStock(qty)) {
            throw new IllegalStateException("재고가 부족합니다. 티켓: " + name);
        }
        this.soldCount += qty;
    }

    /** 판매 수량 감소 (환불 등) */
    public void decrementSoldCount(int qty) {
        this.soldCount = Math.max(0, this.soldCount - qty);
    }

    /** 수정 */
    public void updateDetails(String name, String description, int price, int originalPrice,
                              Integer maxQuantity, boolean isAllSessions, int sortOrder,
                              boolean isActive, LocalDateTime salesStart, LocalDateTime salesEnd) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.maxQuantity = maxQuantity;
        this.isAllSessions = isAllSessions;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
        this.salesStart = salesStart;
        this.salesEnd = salesEnd;
        this.updatedAt = LocalDateTime.now();
    }

    /** 삭제 가능 여부 (판매된 티켓이 있으면 삭제 불가) */
    public boolean isDeletable() {
        return soldCount == 0;
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getPrice() { return price; }
    public int getOriginalPrice() { return originalPrice; }
    public Integer getMaxQuantity() { return maxQuantity; }
    public int getSoldCount() { return soldCount; }
    public boolean getIsAllSessions() { return isAllSessions; }
    public int getSortOrder() { return sortOrder; }
    public boolean getIsActive() { return isActive; }
    public LocalDateTime getSalesStart() { return salesStart; }
    public LocalDateTime getSalesEnd() { return salesEnd; }
    public List<Long> getSessionIds() { return sessionIds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
