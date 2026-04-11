package com.venueon.admin.request.application.port.in;

import com.venueon.admin.request.domain.model.AdminRequest;

/**
 * 어드민: 요청 승인 UseCase
 */
public interface ApproveRequestUseCase {

    /**
     * 요청 승인
     * @param requestId 요청 ID
     * @param adminId 처리하는 어드민 ID
     * @param comment 어드민 코멘트 (nullable)
     */
    AdminRequest approve(Long requestId, Long adminId, String comment);
}
