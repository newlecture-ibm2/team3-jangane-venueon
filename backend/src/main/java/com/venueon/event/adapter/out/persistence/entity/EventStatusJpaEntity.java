package com.venueon.event.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

/**
 * 이벤트 상태 코드 테이블 (도메인 분리)
 */
@Entity
@Table(name = "event_statuses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EventStatusJpaEntity {

    @Id
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // e.g., "DRAFT", "PUBLISHED", "ONGOING", "ENDED", "CANCELLED"

    @Column(nullable = false, length = 100)
    private String label; // e.g., "임시저장", "발행됨", "진행중", "종료됨", "취소됨"

    @Column(length = 255)
    private String description;
}
