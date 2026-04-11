package com.venueon.admin.request.application.port.in;

import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 사용자/호스트: 요청 작성 및 내 요청 조회 UseCase
 */
public interface UserRequestUseCase {

    /**
     * 요청 작성
     */
    AdminRequest createRequest(Long requesterId, RequestCategory category, String title, String content, String attachmentUrl);

    /**
     * 내 요청 목록 조회
     */
    Page<AdminRequest> getMyRequests(Long requesterId, RequestCategory category, RequestStatus status, Pageable pageable);

    /**
     * 내 요청 상세 조회 (본인 요청만)
     */
    AdminRequest getMyRequestById(Long requesterId, Long requestId);
}
