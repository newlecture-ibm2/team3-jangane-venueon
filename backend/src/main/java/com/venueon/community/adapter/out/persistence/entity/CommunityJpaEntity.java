package com.venueon.community.adapter.out.persistence.entity;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "communities")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CommunityJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private EventJpaEntity event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private UserJpaEntity creator;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "member_count")
    @Builder.Default
    private int memberCount = 0;

    @Column(name = "is_public")
    @Builder.Default
    private boolean isPublic = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
