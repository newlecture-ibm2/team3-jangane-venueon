package com.venueon.contact.adapter.in.web;

import com.venueon.admin.contact.adapter.in.web.dto.response.ContactDetailResponse;
import com.venueon.admin.contact.adapter.in.web.dto.response.ContactListResponse;
import com.venueon.admin.contact.adapter.in.web.dto.contact.CreateContactDto;
import com.venueon.contact.application.port.in.UserContactUseCase;
import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import com.venueon.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * 일반 사용자/호스트용 문의 컨트롤러.
 * Core 도메인에 위치 — Admin Actor에서 분리됨.
 * - GET /contacts → 내 문의 목록
 * - POST /contacts → 문의 작성
 * - GET /contacts/{id} → 내 문의 상세
 * - PATCH /contacts/{id}/cancel → 내 문의 취소
 */
@Slf4j
@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class UserContactController {

    private final UserContactUseCase userContactUseCase;
    private final com.venueon.user.adapter.out.persistence.repository.UserJpaRepository userJpaRepository;

    /**
     * GET /contacts — 내 문의 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactListResponse>>> getMyContacts(
            @RequestParam(required = false) ContactCategory category,
            @RequestParam(required = false) ContactStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userJpaRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();
        log.debug("내 문의 목록 조회: userId={}, category={}, status={}", userId, category, status);

        Page<Contact> requests = userContactUseCase.getMyContacts(userId, category, status, pageable);
        Page<ContactListResponse> response = requests.map(ContactListResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /contacts — 문의 작성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ContactDetailResponse>> createContact(
            @Valid @RequestBody CreateContactDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userJpaRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();
        log.debug("문의 작성: userId={}, category={}, title={}", userId, dto.category(), dto.title());

        Contact result = userContactUseCase.createContact(
                userId,
                dto.category(),
                dto.title(),
                dto.content(),
                dto.attachmentUrl());

        ContactDetailResponse response = ContactDetailResponse.from(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * GET /contacts/{id} — 내 문의 상세
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactDetailResponse>> getMyContact(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userJpaRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();
        log.debug("내 문의 상세 조회: userId={}, requestId={}", userId, id);

        Contact contact = userContactUseCase.getMyContactById(userId, id);
        ContactDetailResponse response = ContactDetailResponse.from(contact);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /contacts/{id}/cancel — 내 문의 취소
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ContactDetailResponse>> cancelContact(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userJpaRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();
        log.debug("문의 취소: userId={}, requestId={}", userId, id);

        Contact result = userContactUseCase.cancelContact(userId, id);
        ContactDetailResponse response = ContactDetailResponse.from(result);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
