package com.venueon.badge.adapter.out.persistence.entity;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Badge JPA Entity — DB 매핑 전용
 * event_id는 nullable (이벤트 삭제 시 SET NULL)
 */
@Entity
@Table(name = "badges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BadgeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    private EventJpaEntity event;

    @Column(name = "badge_name", nullable = false)
    private String badgeName;

    @Column(name = "badge_image_url")
    private String badgeImageUrl;

    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private Boolean isVisible = true;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    public boolean isVisible() {
        return isVisible != null && isVisible;
    }
}
