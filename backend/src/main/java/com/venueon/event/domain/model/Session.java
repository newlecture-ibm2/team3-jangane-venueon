package com.venueon.event.domain.model;

import java.time.LocalDateTime;

/**
 * Session 도메인 모델 (순수 POJO)
 * JPA/Spring 의존 없음 — 비즈니스 로직만 포함
 *
 * v6 변경: EventSession → Session 리네이밍.
 * price 제거 (가격은 Ticket의 속성).
 * 모집 관리 필드 3개 추가: recruitStartDate, recruitEndDate, isRecruitmentClosed
 */
public class Session {

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
    private String addressRoad;
    private String addressDetail;
    private boolean isOnline;
    private String onlineLink;

    // 정원 (구매 단위의 가격은 Ticket으로 이동)
    private int maxAttendees;
    private int currentAttendees;

    // 모집 관리
    private LocalDateTime recruitStartDate;
    private LocalDateTime recruitEndDate;
    private boolean isRecruitmentClosed;
    private com.venueon.common.model.DomainCode forcedRecruitmentStatus; // null means AUTO
    private com.venueon.common.model.DomainCode forcedSessionStatus; // null means AUTO

    // 시스템 관리
    private boolean isDefault;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Session() {}

    public Session(Long id, Long eventId, String title, String description, int sortOrder,
                   LocalDateTime startTime, LocalDateTime endTime,
                   String location, String regionSido, String regionSigungu,
                   String addressRoad, String addressDetail,
                   boolean isOnline, String onlineLink,
                   int maxAttendees, int currentAttendees,
                   LocalDateTime recruitStartDate, LocalDateTime recruitEndDate,
                   boolean isRecruitmentClosed, com.venueon.common.model.DomainCode forcedRecruitmentStatus,
                   com.venueon.common.model.DomainCode forcedSessionStatus,
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
        this.addressRoad = addressRoad;
        this.addressDetail = addressDetail;
        this.isOnline = isOnline;
        this.onlineLink = onlineLink;
        this.maxAttendees = maxAttendees;
        this.currentAttendees = currentAttendees;
        this.recruitStartDate = recruitStartDate;
        this.recruitEndDate = recruitEndDate;
        this.isRecruitmentClosed = isRecruitmentClosed;
        this.forcedRecruitmentStatus = forcedRecruitmentStatus;
        this.forcedSessionStatus = forcedSessionStatus;
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
     * 참석자 수 증가 — 설계서 표준 인터페이스 (increaseAttendees)
     * @see #incrementAttendees(int)
     */
    public void increaseAttendees(int quantity) {
        incrementAttendees(quantity);
    }

    /**
     * 참석자 수 감소 (주문 취소/환불 시)
     */
    public void decrementAttendees(int quantity) {
        this.currentAttendees = Math.max(0, this.currentAttendees - quantity);
    }

    /**
     * 참석자 수 감소 — 설계서 표준 인터페이스 (decreaseAttendees)
     * @see #decrementAttendees(int)
     */
    public void decreaseAttendees(int quantity) {
        decrementAttendees(quantity);
    }

    /**
     * 잔여 정원 계산 (Computed)
     * maxAttendees가 0이면 무제한이므로 0 반환
     */
    public int getRemainingCapacity() {
        if (maxAttendees == 0) return 0; // 무제한
        return Math.max(0, maxAttendees - currentAttendees);
    }

    /**
     * 세션 정보 수정
     */
    public void updateDetails(String title, String description, int sortOrder,
                               LocalDateTime startTime, LocalDateTime endTime,
                               String location, String regionSido, String regionSigungu,
                               String addressRoad, String addressDetail,
                               boolean isOnline, String onlineLink,
                               int maxAttendees,
                               LocalDateTime recruitStartDate, LocalDateTime recruitEndDate) {
        this.title = title;
        this.description = description;
        this.sortOrder = sortOrder;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.regionSido = regionSido;
        this.regionSigungu = regionSigungu;
        this.addressRoad = addressRoad;
        this.addressDetail = addressDetail;
        this.isOnline = isOnline;
        this.onlineLink = onlineLink;
        this.maxAttendees = maxAttendees;
        this.recruitStartDate = recruitStartDate;
        this.recruitEndDate = recruitEndDate;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 세션 정렬 순서 변경
     */
    public void changeSortOrder(int newOrder) {
        this.sortOrder = newOrder;
        this.updatedAt = LocalDateTime.now();
    }

    public com.venueon.common.model.DomainCode getRecruitmentStatus() {
        if (forcedRecruitmentStatus != null) return forcedRecruitmentStatus;
        if (isRecruitmentClosed) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감"); // legacy
        if (maxAttendees > 0 && currentAttendees >= maxAttendees) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");
        LocalDateTime now = LocalDateTime.now();
        if (recruitStartDate != null && now.isBefore(recruitStartDate)) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_PENDING_ID, "모집예정");
        if (recruitEndDate != null && now.isAfter(recruitEndDate)) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_CLOSED_ID, "모집마감");
        return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.RECRUIT_STATUS_OPEN_ID, "모집중");
    }

    public com.venueon.common.model.DomainCode getSessionStatus() {
        if (forcedSessionStatus != null) return forcedSessionStatus;
        LocalDateTime now = LocalDateTime.now();
        if (startTime != null && endTime != null) {
            if (now.isBefore(startTime)) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID, "발행됨");
            if (now.isAfter(endTime)) return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID, "종료됨");
            return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID, "진행중");
        }
        return com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID, "발행됨");
    }

    /** 수동 마감 */
    public void closeRecruitment() {
        this.isRecruitmentClosed = true;
        this.updatedAt = LocalDateTime.now();
    }

    /** 마감 해제 */
    public void openRecruitment() {
        this.isRecruitmentClosed = false;
        this.updatedAt = LocalDateTime.now();
    }

    /** 강제 모집 상태 설정 */
    public void setForcedRecruitmentStatus(com.venueon.common.model.DomainCode status) {
        this.forcedRecruitmentStatus = status;
        this.updatedAt = LocalDateTime.now();
    }

    /** 강제 진행 상태 설정 */
    public void setForcedSessionStatus(com.venueon.common.model.DomainCode status) {
        this.forcedSessionStatus = status;
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
    public String getAddressRoad() { return addressRoad; }
    public String getAddressDetail() { return addressDetail; }
    public boolean getIsOnline() { return isOnline; }
    public String getOnlineLink() { return onlineLink; }
    public int getMaxAttendees() { return maxAttendees; }
    public int getCurrentAttendees() { return currentAttendees; }
    public LocalDateTime getRecruitStartDate() { return recruitStartDate; }
    public LocalDateTime getRecruitEndDate() { return recruitEndDate; }
    public boolean getIsRecruitmentClosed() { return isRecruitmentClosed; }
    public com.venueon.common.model.DomainCode getForcedRecruitmentStatus() { return forcedRecruitmentStatus; }
    public com.venueon.common.model.DomainCode getForcedSessionStatus() { return forcedSessionStatus; }
    public boolean getIsDefault() { return isDefault; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
