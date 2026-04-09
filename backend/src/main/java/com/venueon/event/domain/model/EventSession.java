package com.venueon.event.domain.model;

import java.time.LocalDateTime;

/**
 * EventSession 도메인 모델 (순수 POJO)
 * JPA/Spring 의존 없음 — 비즈니스 로직만 포함
 *
 * 세션은 이벤트의 구매 단위이며, 각각 독립적인 장소/가격/정원을 가진다.
 * hasSession=false인 이벤트도 내부적으로 기본 세션(is_default=true) 1개가 자동 생성된다.
 */
public class EventSession {

    private Long id;
    private Long eventId;
    private String title;
    private String description;
    private int sortOrder;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // 장소 / 온라인 (세션별 독립)
    private String location;
    private String regionSido;
    private String regionSigungu;
    private boolean isOnline;
    private String onlineLink;

    // 가격 / 정원 (구매 단위)
    private int price;
    private int maxAttendees;
    private int currentAttendees;

    // 시스템 관리
    private boolean isDefault;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected EventSession() {}

    public EventSession(Long id, Long eventId, String title, String description, int sortOrder,
                         LocalDateTime startTime, LocalDateTime endTime,
                         String location, String regionSido, String regionSigungu,
                         boolean isOnline, String onlineLink,
                         int price, int maxAttendees, int currentAttendees,
                         boolean isDefault,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.eventId = eventId;
        this.title = title;
        this.description = description;
        this.sortOrder = sortOrder;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.regionSido = regionSido;
        this.regionSigungu = regionSigungu;
        this.isOnline = isOnline;
        this.onlineLink = onlineLink;
        this.price = price;
        this.maxAttendees = maxAttendees;
        this.currentAttendees = currentAttendees;
        this.isDefault = isDefault;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- 비즈니스 행위 메서드 ---

    /**
     * 정원이 남아있는지 확인
     */
    public boolean isAvailable() {
        return maxAttendees == 0 || currentAttendees < maxAttendees;
    }

    /**
     * 요청 수량만큼 자리가 있는지 확인
     */
    public boolean hasCapacity(int quantity) {
        return maxAttendees == 0 || (currentAttendees + quantity) <= maxAttendees;
    }

    /**
     * 참석자 수 증가 (주문 확정 시)
     */
    public void incrementAttendees(int quantity) {
        this.currentAttendees += quantity;
    }

    /**
     * 참석자 수 감소 (주문 취소/환불 시)
     */
    public void decrementAttendees(int quantity) {
        this.currentAttendees = Math.max(0, this.currentAttendees - quantity);
    }

    /**
     * 세션 정보 수정
     */
    public void updateDetails(String title, String description, int sortOrder,
                               LocalDateTime startTime, LocalDateTime endTime,
                               String location, String regionSido, String regionSigungu,
                               boolean isOnline, String onlineLink,
                               int price, int maxAttendees) {
        this.title = title;
        this.description = description;
        this.sortOrder = sortOrder;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.regionSido = regionSido;
        this.regionSigungu = regionSigungu;
        this.isOnline = isOnline;
        this.onlineLink = onlineLink;
        this.price = price;
        this.maxAttendees = maxAttendees;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 세션 정렬 순서 변경
     */
    public void changeSortOrder(int newOrder) {
        this.sortOrder = newOrder;
        this.updatedAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public int getSortOrder() { return sortOrder; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public String getLocation() { return location; }
    public String getRegionSido() { return regionSido; }
    public String getRegionSigungu() { return regionSigungu; }
    public boolean getIsOnline() { return isOnline; }
    public String getOnlineLink() { return onlineLink; }
    public int getPrice() { return price; }
    public int getMaxAttendees() { return maxAttendees; }
    public int getCurrentAttendees() { return currentAttendees; }
    public boolean getIsDefault() { return isDefault; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
