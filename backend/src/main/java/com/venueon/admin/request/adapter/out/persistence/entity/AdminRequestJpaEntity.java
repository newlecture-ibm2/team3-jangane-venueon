package com.venueon.admin.request.adapter.out.persistence.entity;

import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 어드민 요청 JPA 엔티티
 */
@Entity
@Table(name = "admin_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRequestJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requester_id", nullable = false)
    private Long requesterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private RequestCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "processed_by")
    private Long processedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
