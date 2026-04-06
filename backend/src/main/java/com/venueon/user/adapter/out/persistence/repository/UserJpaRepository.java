package com.venueon.user.adapter.out.persistence.repository;

import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.domain.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    // --- 관리자용 검색 메서드 ---

    /**
     * 키워드로 검색 (이메일 또는 닉네임에 포함)
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<UserJpaEntity> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 역할별 필터링
     */
    Page<UserJpaEntity> findByRole(UserRole role, Pageable pageable);

    /**
     * 키워드 + 역할 복합 검색
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE " +
           "u.role = :role AND " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<UserJpaEntity> findByKeywordAndRole(@Param("keyword") String keyword,
                                              @Param("role") UserRole role,
                                              Pageable pageable);
}
