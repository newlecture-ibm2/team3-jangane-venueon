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

    @Column(name = "is_online")
    @Builder.Default
    private boolean isOnline = false;

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
    private boolean isRecruitmentClosed = false;

    // 시스템 관리
    @Column(name = "is_default")
    @Builder.Default
    private boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
