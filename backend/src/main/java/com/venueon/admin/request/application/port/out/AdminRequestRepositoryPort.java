package com.venueon.admin.request.application.port.out;

import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 어드민 요청 Repository Port (Out)
 */
public interface AdminRequestRepositoryPort {

    /**
     * 요청 저장 (생성/수정)
     */
    AdminRequest save(AdminRequest request);

    /**
     * ID로 요청 조회
     */
    Optional<AdminRequest> findById(Long id);

    /**
     * 어드민용: 필터링된 요청 목록 조회
     */
    Page<AdminRequest> findAllWithFilters(RequestCategory category, RequestStatus status, Pageable pageable);

    /**
     * 사용자용: 내 요청 목록 조회
     */
    Page<AdminRequest> findByRequesterIdWithFilters(Long requesterId, RequestCategory category, RequestStatus status, Pageable pageable);
}
