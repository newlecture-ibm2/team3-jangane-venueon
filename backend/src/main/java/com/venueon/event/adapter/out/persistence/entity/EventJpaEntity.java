package com.venueon.event.adapter.out.persistence.entity;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import com.venueon.event.domain.model.PurchaseType;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EventJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private UserJpaEntity creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryJpaEntity category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    private String location;

    @Column(name = "is_online")
    @Builder.Default
    private boolean isOnline = false;

    @Builder.Default
    private int price = 0;

    @Column(name = "max_attendees")
    private int maxAttendees;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean isHidden = false;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "has_session")
    @Builder.Default
    private boolean hasSession = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_type")
    @Builder.Default
    private PurchaseType purchaseType = PurchaseType.SINGLE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 연관관계 추가: CASCADE DELETE 설정
    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventSessionJpaEntity> sessions = new ArrayList<>();
}
