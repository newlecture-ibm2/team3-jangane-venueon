package com.venueon.admin.user.application.port.out;

import com.venueon.user.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 관리자용 사용자 조회/수정 Port (Port-Out)
 * - 반환 타입은 반드시 도메인 모델(User)만 사용
 * - JPA Entity 반환 금지
 */
public interface AdminUserRepositoryPort {

    /**
     * 회원 목록 동적 조회 (키워드, 역할, 상태 필터)
     */
    Page<User> findUsers(String keyword, String role, Boolean active, Pageable pageable);

    /**
     * ID로 회원 조회
     */
    Optional<User> findById(Long id);

    /**
     * 회원 정보 저장 (수정 시 사용)
     */
    User save(User user);

    /**
     * ID 존재 여부 확인
     */
    boolean existsById(Long id);

    /**
     * ID로 호스트 프로필 조회
     */
    Optional<com.venueon.user.domain.model.HostProfile> findHostProfileByUserId(Long userId);

    /**
     * 회원 삭제
     */
    void deleteById(Long id);
}
