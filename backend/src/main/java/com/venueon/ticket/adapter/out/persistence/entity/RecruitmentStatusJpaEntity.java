package com.venueon.ticket.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

/**
 * 모집 상태 코드 테이블 (도메인 분리)
 */
@Entity
@Table(name = "recruitment_statuses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RecruitmentStatusJpaEntity {

    @Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // e.g., "PENDING", "OPEN", "CLOSED"

    @Column(nullable = false, length = 100)
    private String label; // e.g., "모집 예정", "모집 중", "모집 마감"

    @Column(length = 255)
    private String description;
}
