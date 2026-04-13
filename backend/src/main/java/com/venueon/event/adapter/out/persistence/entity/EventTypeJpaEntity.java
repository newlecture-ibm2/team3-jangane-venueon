package com.venueon.event.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

/**
 * 이벤트 유형 코드 테이블 (도메인 분리)
 */
@Entity
@Table(name = "event_types")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EventTypeJpaEntity {

    @Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // e.g., "CLASS", "SEMINAR", "CONFERENCE"

    @Column(nullable = false, length = 100)
    private String name; // e.g., "클래스", "세미나", "컨퍼런스"

    @Column(length = 255)
    private String description;
}
