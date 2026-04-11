package com.venueon.admin.request.adapter.out.persistence.repository;

import com.venueon.admin.request.adapter.out.persistence.entity.AdminRequestJpaEntity;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 어드민 요청 JPA Repository
 */
public interface AdminRequestJpaRepository extends JpaRepository<AdminRequestJpaEntity, Long> {

    /**
     * 어드민용: 카테고리 + 상태 필터 조회
     */
    @Query("SELECT r FROM AdminRequestJpaEntity r " +
           "WHERE (:category IS NULL OR r.category = :category) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.createdAt DESC")
    Page<AdminRequestJpaEntity> findAllWithFilters(
            @Param("category") RequestCategory category,
            @Param("status") RequestStatus status,
            Pageable pageable);

    /**
     * 사용자용: 내 요청 목록 (카테고리 + 상태 필터)
     */
    @Query("SELECT r FROM AdminRequestJpaEntity r " +
           "WHERE r.requesterId = :requesterId " +
           "AND (:category IS NULL OR r.category = :category) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.createdAt DESC")
    Page<AdminRequestJpaEntity> findByRequesterIdWithFilters(
            @Param("requesterId") Long requesterId,
            @Param("category") RequestCategory category,
            @Param("status") RequestStatus status,
            Pageable pageable);
}
