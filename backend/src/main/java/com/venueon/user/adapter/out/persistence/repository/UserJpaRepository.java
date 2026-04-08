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

    /**
     * 상태, 키워드, 역할 복합 동적 검색
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE " +
           "(:hasKeyword = false OR LOWER(u.email) LIKE CONCAT('%', :keyword, '%') OR LOWER(u.nickname) LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:hasRole = false OR u.role = :role) " +
           "AND (:hasActive = false OR u.isActive = :active)")
    Page<UserJpaEntity> findUsersDynamically(@Param("keyword") String keyword,
                                             @Param("hasKeyword") boolean hasKeyword,
                                             @Param("role") UserRole role,
                                             @Param("hasRole") boolean hasRole,
                                             @Param("active") Boolean active,
                                             @Param("hasActive") boolean hasActive,
                                             Pageable pageable);
}
