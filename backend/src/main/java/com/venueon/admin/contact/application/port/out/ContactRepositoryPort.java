package com.venueon.admin.contact.application.port.out;

import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 어드민 요청 Repository Port (Out)
 */
public interface ContactRepositoryPort {

    /**
     * 요청 저장 (생성/수정)
     */
    Contact save(Contact contact);

    /**
     * ID로 요청 조회
     */
    Optional<Contact> findById(Long id);

    /**
     * 어드민용: 필터링된 요청 목록 조회
     */
    Page<Contact> findAllWithFilters(ContactCategory category, ContactStatus status, Pageable pageable);

    /**
     * 사용자용: 내 요청 목록 조회
     */
    Page<Contact> findByRequesterIdWithFilters(Long requesterId, ContactCategory category, ContactStatus status, Pageable pageable);
}
