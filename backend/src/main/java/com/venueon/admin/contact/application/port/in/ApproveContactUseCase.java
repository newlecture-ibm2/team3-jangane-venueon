package com.venueon.admin.contact.application.port.in;

import com.venueon.admin.contact.domain.model.Contact;

/**
 * 어드민: 요청 승인 UseCase
 */
public interface ApproveContactUseCase {

    /**
     * 요청 승인
     * @param requestId 요청 ID
     * @param adminId 처리하는 어드민 ID
     * @param comment 어드민 코멘트 (nullable)
     */
    Contact approve(Long requestId, Long adminId, String comment);
}
