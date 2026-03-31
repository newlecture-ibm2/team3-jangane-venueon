package com.venueon.event.domain.model;

import java.time.LocalDateTime;

/**
 * Event 도메인 모델 (순수 POJO)
 * JPA/Spring 의존 없음 — 비즈니스 로직만 포함
 */
public class Event {

    private Long id;
    private Long creatorId;
    private Long categoryId;
    private String title;
    private String description;
    private EventType type;
    private EventStatus status;
    private String location;
    private boolean isOnline;
    private int price;
    private int maxAttendees;
    private String thumbnailUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Event() {}

    public Event(Long id, Long creatorId, Long categoryId, String title, String description,
                 EventType type, EventStatus status, String location, boolean isOnline,
                 int price, int maxAttendees, String thumbnailUrl,
                 LocalDateTime startDate, LocalDateTime endDate,
                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.creatorId = creatorId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = status;
        this.location = location;
        this.isOnline = isOnline;
        this.price = price;
        this.maxAttendees = maxAttendees;
        this.thumbnailUrl = thumbnailUrl;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- 비즈니스 행위 메서드 ---

    public boolean isFree() {
        return this.price == 0;
    }

    public void publish() {
        if (this.status != EventStatus.DRAFT) {
            throw new IllegalStateException("DRAFT 상태에서만 공개 가능합니다.");
        }
        this.status = EventStatus.PUBLISHED;
    }

    public void end() {
        this.status = EventStatus.ENDED;
    }

    public void cancel() {
        this.status = EventStatus.CANCELLED;
    }

    public boolean isEditable() {
        return this.status == EventStatus.DRAFT;
    }

    public boolean isOwnedBy(Long userId) {
        return this.creatorId != null && this.creatorId.equals(userId);
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getCreatorId() { return creatorId; }
    public Long getCategoryId() { return categoryId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public EventType getType() { return type; }
    public EventStatus getStatus() { return status; }
    public String getLocation() { return location; }
    public boolean getIsOnline() { return isOnline; }
    public int getPrice() { return price; }
    public int getMaxAttendees() { return maxAttendees; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
