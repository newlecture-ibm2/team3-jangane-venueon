package com.venueon.admin.user.application.port.out;

import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.UserRole;
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
     * 전체 회원 목록 조회 (페이징)
     */
    Page<User> findAll(Pageable pageable);

    /**
     * 키워드 검색 (이메일 또는 닉네임)
     */
    Page<User> findByKeyword(String keyword, Pageable pageable);

    /**
     * 역할별 필터링
     */
    Page<User> findByRole(UserRole role, Pageable pageable);

    /**
     * 키워드 + 역할 복합 검색
     */
    Page<User> findByKeywordAndRole(String keyword, UserRole role, Pageable pageable);

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
     * 회원 삭제
     */
    void deleteById(Long id);
}
