package com.venueon.admin.contact.application.port.in;

import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 사용자/호스트: 요청 작성 및 내 요청 조회 UseCase
 */
public interface UserContactUseCase {

    /**
     * 요청 작성
     */
    Contact createContact(Long requesterId, ContactCategory category, String title, String content, String attachmentUrl);

    /**
     * 내 요청 목록 조회
     */
    Page<Contact> getMyContacts(Long requesterId, ContactCategory category, ContactStatus status, Pageable pageable);

    /**
     * 내 요청 상세 조회 (본인 요청만)
     */
    Contact getMyContactById(Long requesterId, Long requestId);

    /**
     * 내 요청 취소 (PENDING/REVIEWING 상태만)
     */
    Contact cancelContact(Long requesterId, Long requestId);
}
