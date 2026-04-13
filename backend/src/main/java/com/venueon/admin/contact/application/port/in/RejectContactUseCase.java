package com.venueon.admin.contact.application.port.in;

import com.venueon.admin.contact.domain.model.Contact;

/**
 * 어드민: 요청 거절 UseCase
 */
public interface RejectContactUseCase {

    /**
     * 요청 거절
     * @param requestId 요청 ID
     * @param adminId 처리하는 어드민 ID
     * @param reason 거절 사유 (필수)
     */
    Contact reject(Long requestId, Long adminId, String reason);
}
