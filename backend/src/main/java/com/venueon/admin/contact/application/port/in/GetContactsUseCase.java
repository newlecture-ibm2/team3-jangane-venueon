package com.venueon.admin.contact.application.port.in;

import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 어드민: 요청 목록 조회 UseCase
 */
public interface GetContactsUseCase {

    /**
     * 어드민용 필터 조회
     */
    Page<Contact> getContacts(ContactCategory category, ContactStatus status, Pageable pageable);

    /**
     * 요청 상세 조회
     */
    Contact getContactById(Long id);
}
