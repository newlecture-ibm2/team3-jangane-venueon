package com.venueon.event.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Session JPA Entity — DB 매핑 전용 (테이블명 event_sessions 유지)
 * v6: price 제거, recruit_start_date/recruit_end_date/is_recruitment_closed 추가
 * 클래스명 EventSessionJpaEntity → SessionJpaEntity 변경
 */
@Entity
@Table(name = "event_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SessionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private EventJpaEntity event;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order")
    @Builder.Default
    private int sortOrder = 0;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // 장소 / 온라인 (세션별 독립)
    private String location;

    @Column(name = "region_sido")
    private String regionSido;

    @Column(name = "region_sigungu")
    private String regionSigungu;

    @Column(name = "address_road", length = 200)
    private String addressRoad;

    @Column(name = "address_detail", length = 100)
    private String addressDetail;

    @Column(name = "is_online")
    @Builder.Default
    private Boolean isOnline = false;

    @Column(name = "online_link")
    private String onlineLink;

    // 정원
    @Column(name = "max_attendees")
    @Builder.Default
    private int maxAttendees = 0;

    @Column(name = "current_attendees")
    @Builder.Default
    private int currentAttendees = 0;

    // 모집 관리
    @Column(name = "recruit_start_date")
    private LocalDateTime recruitStartDate;

    @Column(name = "recruit_end_date")
    private LocalDateTime recruitEndDate;

    @Column(name = "is_recruitment_closed")
    @Builder.Default
    private Boolean isRecruitmentClosed = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "forced_recruitment_status_id")
    private com.venueon.ticket.adapter.out.persistence.entity.RecruitmentStatusJpaEntity forcedRecruitmentStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "forced_session_status_id")
    private EventStatusJpaEntity forcedSessionStatus;

    // 시스템 관리
    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isOnline() {
        return isOnline != null && isOnline;
    }

    public boolean isRecruitmentClosed() {
        return isRecruitmentClosed != null && isRecruitmentClosed;
    }

    public boolean isDefault() {
        return isDefault != null && isDefault;
    }
}
