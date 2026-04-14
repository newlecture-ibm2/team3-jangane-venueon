package com.venueon.admin.contact.application.service;

import com.venueon.admin.contact.application.port.in.ApproveContactUseCase;
import com.venueon.admin.contact.application.port.in.GetContactsUseCase;
import com.venueon.admin.contact.application.port.in.RejectContactUseCase;
import com.venueon.contact.application.port.in.UserContactUseCase;
import com.venueon.admin.contact.application.port.out.ContactRepositoryPort;
import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 어드민 요청 서비스
 * - Admin: 목록 조회, 승인, 거절
 * - User/Host: 요청 작성, 내 목록 조회, 상세 조회
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactService implements
        GetContactsUseCase,
        ApproveContactUseCase,
        RejectContactUseCase,
        UserContactUseCase {

    private final ContactRepositoryPort requestRepository;

    // ── 어드민 기능 ──

    @Override
    public Page<Contact> getContacts(ContactCategory category, ContactStatus status, Pageable pageable) {
        log.debug("어드민 요청 목록 조회: category={}, status={}", category, status);
        return requestRepository.findAllWithFilters(category, status, pageable);
    }

    private Contact findRequestOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "요청을 찾을 수 없습니다. id=" + id));
    }

    @Override
    @Transactional
    public Contact getContactById(Long id) {
        Contact contact = findRequestOrThrow(id);

        // 어드민이 처음 조회하면 PENDING을 REVIEWING으로 변경
        if (contact.getStatus() == ContactStatus.PENDING) {
            contact.markAsReviewing();
            requestRepository.save(contact);
        }

        return contact;
    }

    @Override
    @Transactional
    public Contact approve(Long requestId, Long adminId, String comment) {
        Contact contact = findRequestOrThrow(requestId);

        if (contact.getStatus() == ContactStatus.COMPLETED || contact.getStatus() == ContactStatus.REJECTED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 처리된 요청입니다.");
        }

        contact.approve(adminId, comment);
        Contact saved = requestRepository.save(contact);

        log.info("요청 승인 완료: requestId={}, adminId={}", requestId, adminId);
        return saved;
    }

    @Override
    @Transactional
    public Contact reject(Long requestId, Long adminId, String reason) {
        Contact contact = findRequestOrThrow(requestId);

        if (contact.getStatus() == ContactStatus.COMPLETED || contact.getStatus() == ContactStatus.REJECTED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 처리된 요청입니다.");
        }

        contact.reject(adminId, reason);
        Contact saved = requestRepository.save(contact);

        log.info("요청 거절 완료: requestId={}, adminId={}, reason={}", requestId, adminId, reason);
        return saved;
    }

    // ── 사용자/호스트 기능 ──

    @Override
    @Transactional
    public Contact createContact(Long requesterId, ContactCategory category, String title, String content, String attachmentUrl) {
        Contact contact = Contact.builder()
                .requesterId(requesterId)
                .category(category)
                .status(ContactStatus.PENDING)
                .title(title)
                .content(content)
                .attachmentUrl(attachmentUrl)
                .build();

        Contact saved = requestRepository.save(contact);
        log.info("새 요청 작성: id={}, requesterId={}, category={}", saved.getId(), requesterId, category);
        return saved;
    }

    @Override
    public Page<Contact> getMyContacts(Long requesterId, ContactCategory category, ContactStatus status, Pageable pageable) {
        log.debug("내 요청 목록 조회: requesterId={}, category={}, status={}", requesterId, category, status);
        return requestRepository.findByRequesterIdWithFilters(requesterId, category, status, pageable);
    }

    @Override
    public Contact getMyContactById(Long requesterId, Long requestId) {
        Contact contact = findRequestOrThrow(requestId);

        if (!contact.getRequesterId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 요청만 조회할 수 있습니다.");
        }

        return contact;
    }

    @Override
    @Transactional
    public Contact cancelContact(Long requesterId, Long requestId) {
        Contact contact = findRequestOrThrow(requestId);

        if (!contact.getRequesterId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 요청만 취소할 수 있습니다.");
        }

        if (contact.getStatus() == ContactStatus.COMPLETED || contact.getStatus() == ContactStatus.REJECTED || contact.getStatus() == ContactStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 처리된 요청은 취소할 수 없습니다.");
        }

        contact.cancel();
        Contact saved = requestRepository.save(contact);

        log.info("요청 취소 완료: requestId={}, requesterId={}", requestId, requesterId);
        return saved;
    }
}
