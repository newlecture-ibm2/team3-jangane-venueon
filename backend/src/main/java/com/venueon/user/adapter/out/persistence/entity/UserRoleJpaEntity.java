package com.venueon.user.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

/**
 * 유저 역할 코드 테이블 (도메인 분리)
 */
@Entity
@Table(name = "user_roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserRoleJpaEntity {

    @Id
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // e.g., "USER", "HOST", "ADMIN"

    @Column(nullable = false, length = 100)
    private String name; // e.g., "일반 사용자", "호스트", "관리자"

    @Column(length = 255)
    private String description;
}
