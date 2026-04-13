package com.venueon.admin.contact.adapter.in.web;

import com.venueon.admin.contact.adapter.in.web.dto.contact.ProcessContactDto;
import com.venueon.admin.contact.adapter.in.web.dto.response.ContactDetailResponse;
import com.venueon.admin.contact.adapter.in.web.dto.response.ContactListResponse;
import com.venueon.admin.contact.application.port.in.ApproveContactUseCase;
import com.venueon.admin.contact.application.port.in.GetContactsUseCase;
import com.venueon.admin.contact.application.port.in.RejectContactUseCase;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * 어드민용 요청 관리 컨트롤러
 * - GET /admin/contacts → 요청 목록 (필터: category, status)
 * - GET /admin/contacts/{id} → 요청 상세
 * - PATCH /admin/contacts/{id}/approve → 승인
 * - PATCH /admin/contacts/{id}/reject → 거절
 */
@Slf4j
@RestController
@RequestMapping("/admin/contacts")
@RequiredArgsConstructor
public class AdminContactController {

    private final GetContactsUseCase getContactsUseCase;
    private final ApproveContactUseCase approveContactUseCase;
    private final RejectContactUseCase rejectContactUseCase;
    private final com.venueon.user.adapter.out.persistence.repository.UserJpaRepository userJpaRepository;

    /**
     * GET /admin/contacts — 요청 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactListResponse>>> getContacts(
            @RequestParam(required = false) ContactCategory category,
            @RequestParam(required = false) ContactStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.debug("어드민 요청 목록 조회: category={}, status={}", category, status);

        Page<Contact> requests = getContactsUseCase.getContacts(category, status, pageable);
        Page<ContactListResponse> response = requests.map(ContactListResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /admin/contacts/{id} — 요청 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactDetailResponse>> getContact(@PathVariable Long id) {
        log.debug("어드민 요청 상세 조회: id={}", id);

        Contact contact = getContactsUseCase.getContactById(id);
        ContactDetailResponse response = ContactDetailResponse.from(contact);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /admin/contacts/{id}/approve — 승인
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ContactDetailResponse>> approveContact(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ProcessContactDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long adminId = userJpaRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();
        String comment = (dto != null) ? dto.comment() : null;

        log.debug("요청 승인: id={}, adminId={}", id, adminId);

        Contact result = approveContactUseCase.approve(id, adminId, comment);
        ContactDetailResponse response = ContactDetailResponse.from(result);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /admin/contacts/{id}/reject — 거절
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ContactDetailResponse>> rejectContact(
            @PathVariable Long id,
            @Valid @RequestBody ProcessContactDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long adminId = userJpaRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();

        log.debug("요청 거절: id={}, adminId={}, reason={}", id, adminId, dto.comment());

        Contact result = rejectContactUseCase.reject(id, adminId, dto.comment());
        ContactDetailResponse response = ContactDetailResponse.from(result);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
