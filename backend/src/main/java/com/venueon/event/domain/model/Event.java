package com.venueon.event.domain.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Event 도메인 모델 (순수 POJO)
 * JPA/Spring 의존 없음 — 비즈니스 로직만 포함
 *
 * v6 변경: price, maxAttendees, location, startDate, endDate, purchaseType, isOnline 제거.
 * 가격 → Ticket, 일정/장소/정원 → Session에서 관리. 이벤트 기간은 세션에서 도출.
 */
public class Event {

    private Long id;
    private Long creatorId;
    private Long categoryId;
    private String title;
    private String description;
    private com.venueon.common.model.DomainCode type;
    private com.venueon.common.model.DomainCode status;
    private String thumbnailUrl;
    private boolean hasSession;
    private boolean isHidden;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Event() {}

    public Event(Long id, Long creatorId, Long categoryId, String title, String description,
                 com.venueon.common.model.DomainCode type, com.venueon.common.model.DomainCode status, String thumbnailUrl,
                 boolean hasSession, boolean isHidden,
                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.creatorId = creatorId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = status;
        this.thumbnailUrl = thumbnailUrl;
        this.hasSession = hasSession;
        this.isHidden = isHidden;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- 비즈니스 행위 메서드 ---

    public void publish() {
        if (!this.status.id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID) && 
            !this.status.id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_CANCELLED_ID)) {
            throw new IllegalStateException("DRAFT 또는 CANCELLED 상태에서만 공개 가능합니다.");
        }
        this.status = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID, "발행됨");
    }

    public void revertToDraft() {
        this.status = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID, "임시저장");
    }

    public void end() {
        this.status = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID, "종료됨");
    }

    public void cancel() {
        this.status = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_CANCELLED_ID, "취소됨");
    }

    public boolean isEditable() {
        return this.status != null && this.status.id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID);
    }

    public void updateDetails(Long categoryId, String title, String description, com.venueon.common.model.DomainCode type,
                              String thumbnailUrl, boolean hasSession) {
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.type = type;
        if (thumbnailUrl != null) {
            this.thumbnailUrl = thumbnailUrl;
        }
        this.hasSession = hasSession;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isOwnedBy(Long userId) {
        return this.creatorId != null && this.creatorId.equals(userId);
    }

    // --- Computed Methods (세션 기반) ---

    /**
     * 이벤트의 유효 상태 계산 (ONGOING은 세션 기반)
     * DB status가 PUBLISHED이고, 세션 중 1개라도 진행 중(ONGOING)이면 ONGOING 반환
     */
    public com.venueon.common.model.DomainCode getEffectiveStatus(List<Session> sessions) {
        if (this.status != null && this.status.id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID) && sessions != null) {
            boolean anyOngoing = sessions.stream()
                    .anyMatch(s -> s.getSessionStatus() != null && s.getSessionStatus().id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID));
            if (anyOngoing) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID, "진행중");

            boolean allEnded = sessions.stream()
                    .allMatch(s -> s.getSessionStatus() != null && s.getSessionStatus().id().equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID));
            if (allEnded && !sessions.isEmpty()) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID, "종료됨");
        }
        return this.status;
    }

    /**
     * 이벤트 레벨 모집 상태 = 세션 OR 종합
     * 1개라도 OPEN → OPEN / 모두 PENDING → PENDING / 모두 CLOSED → CLOSED
     */
    public com.venueon.common.model.DomainCode getRecruitmentStatus(List<Session> sessions) {
        if (sessions == null || sessions.isEmpty()) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");

        boolean anyOpen = sessions.stream()
                .anyMatch(s -> s.getRecruitmentStatus() != null && s.getRecruitmentStatus().id().equals(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_OPEN_ID));
        if (anyOpen) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_OPEN_ID, "모집중");

        boolean allPending = sessions.stream()
                .allMatch(s -> s.getRecruitmentStatus() != null && s.getRecruitmentStatus().id().equals(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_PENDING_ID));
        if (allPending) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_PENDING_ID, "모집예정");

        return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");
    }

    /**
     * 이벤트 시작일 = min(세션들의 startTime)
     */
    public LocalDateTime getStartDate(List<Session> sessions) {
        if (sessions == null || sessions.isEmpty()) return null;
        return sessions.stream()
                .map(Session::getStartTime)
                .filter(t -> t != null)
                .min(LocalDateTime::compareTo)
                .orElse(null);
    }

    /**
     * 이벤트 종료일 = max(세션들의 endTime)
     */
    public LocalDateTime getEndDate(List<Session> sessions) {
        if (sessions == null || sessions.isEmpty()) return null;
        return sessions.stream()
                .map(Session::getEndTime)
                .filter(t -> t != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
    }

    /**
     * 게시(PUBLISHED) 전 검증 — 세션 데이터 완전성 확인
     */
    public void validateForPublish(List<Session> sessions) {
        if (sessions == null || sessions.isEmpty()) {
            throw new IllegalStateException("게시할 이벤트에는 최소 1개의 세션이 필요합니다.");
        }
        for (Session s : sessions) {
            if (s.getStartTime() == null || s.getEndTime() == null) {
                throw new IllegalStateException("모든 세션의 시작/종료 시각이 필요합니다. 세션: " + s.getTitle());
            }
            if (!s.getEndTime().isAfter(s.getStartTime())) {
                throw new IllegalStateException("종료 시각이 시작 시각 이후여야 합니다. 세션: " + s.getTitle());
            }
            if (!s.getIsOnline() && (s.getLocation() == null || s.getLocation().isBlank())) {
                throw new IllegalStateException("오프라인 세션에는 장소가 필요합니다. 세션: " + s.getTitle());
            }
        }
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getCreatorId() { return creatorId; }
    public Long getCategoryId() { return categoryId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public com.venueon.common.model.DomainCode getType() { return type; }
    public com.venueon.common.model.DomainCode getStatus() { return status; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public boolean getHasSession() { return hasSession; }
    public boolean getIsHidden() { return isHidden; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
