package com.venueon.admin.request.application.port.in;

import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 어드민: 요청 목록 조회 UseCase
 */
public interface GetAdminRequestsUseCase {

    /**
     * 어드민용 필터 조회
     */
    Page<AdminRequest> getRequests(RequestCategory category, RequestStatus status, Pageable pageable);

    /**
     * 요청 상세 조회
     */
    AdminRequest getRequestById(Long id);
}
