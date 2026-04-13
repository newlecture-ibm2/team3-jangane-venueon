package com.venueon.admin.contact.adapter.out.persistence.repository;

import com.venueon.admin.contact.adapter.out.persistence.entity.ContactJpaEntity;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 어드민 요청 JPA Repository
 */
public interface ContactJpaRepository extends JpaRepository<ContactJpaEntity, Long> {

    /**
     * 어드민용: 카테고리 + 상태 필터 조회
     */
    @Query("SELECT r FROM ContactJpaEntity r " +
           "WHERE (:category IS NULL OR r.category = :category) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.createdAt DESC")
    Page<ContactJpaEntity> findAllWithFilters(
            @Param("category") ContactCategory category,
            @Param("status") ContactStatus status,
            Pageable pageable);

    /**
     * 사용자용: 내 요청 목록 (카테고리 + 상태 필터)
     */
    @Query("SELECT r FROM ContactJpaEntity r " +
           "WHERE r.requesterId = :requesterId " +
           "AND (:category IS NULL OR r.category = :category) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.createdAt DESC")
    Page<ContactJpaEntity> findByRequesterIdWithFilters(
            @Param("requesterId") Long requesterId,
            @Param("category") ContactCategory category,
            @Param("status") ContactStatus status,
            Pageable pageable);
}
