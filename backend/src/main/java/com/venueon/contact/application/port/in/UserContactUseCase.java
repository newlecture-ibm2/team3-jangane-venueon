package com.venueon.contact.application.port.in;

import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 일반 사용자/호스트: 문의 작성 및 내 문의 조회 UseCase.
 * Core 도메인에 위치 — Admin이 아닌 일반 사용자 기능.
 */
public interface UserContactUseCase {

    /**
     * 문의 작성
     */
    Contact createContact(Long requesterId, ContactCategory category, String title, String content, String attachmentUrl);

    /**
     * 내 문의 목록 조회
     */
    Page<Contact> getMyContacts(Long requesterId, ContactCategory category, ContactStatus status, Pageable pageable);

    /**
     * 내 문의 상세 조회 (본인 문의만)
     */
    Contact getMyContactById(Long requesterId, Long requestId);

    /**
     * 내 문의 취소 (PENDING/REVIEWING 상태만)
     */
    Contact cancelContact(Long requesterId, Long requestId);
}
