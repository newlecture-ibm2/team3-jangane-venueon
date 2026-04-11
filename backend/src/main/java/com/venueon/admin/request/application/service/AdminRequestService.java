package com.venueon.admin.request.application.service;

import com.venueon.admin.request.application.port.in.ApproveRequestUseCase;
import com.venueon.admin.request.application.port.in.GetAdminRequestsUseCase;
import com.venueon.admin.request.application.port.in.RejectRequestUseCase;
import com.venueon.admin.request.application.port.in.UserRequestUseCase;
import com.venueon.admin.request.application.port.out.AdminRequestRepositoryPort;
import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
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
public class AdminRequestService implements
        GetAdminRequestsUseCase,
        ApproveRequestUseCase,
        RejectRequestUseCase,
        UserRequestUseCase {

    private final AdminRequestRepositoryPort requestRepository;

    // ── 어드민 기능 ──

    @Override
    public Page<AdminRequest> getRequests(RequestCategory category, RequestStatus status, Pageable pageable) {
        log.debug("어드민 요청 목록 조회: category={}, status={}", category, status);
        return requestRepository.findAllWithFilters(category, status, pageable);
    }

    private AdminRequest findRequestOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "요청을 찾을 수 없습니다. id=" + id));
    }

    @Override
    @Transactional
    public AdminRequest getRequestById(Long id) {
        AdminRequest request = findRequestOrThrow(id);

        // 어드민이 처음 조회하면 PENDING을 REVIEWING으로 변경
        if (request.getStatus() == RequestStatus.PENDING) {
            request.markAsReviewing();
            requestRepository.save(request);
        }

        return request;
    }

    @Override
    @Transactional
    public AdminRequest approve(Long requestId, Long adminId, String comment) {
        AdminRequest request = findRequestOrThrow(requestId);

        if (request.getStatus() == RequestStatus.COMPLETED || request.getStatus() == RequestStatus.REJECTED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 처리된 요청입니다.");
        }

        request.approve(adminId, comment);
        AdminRequest saved = requestRepository.save(request);

        log.info("요청 승인 완료: requestId={}, adminId={}", requestId, adminId);
        return saved;
    }

    @Override
    @Transactional
    public AdminRequest reject(Long requestId, Long adminId, String reason) {
        AdminRequest request = findRequestOrThrow(requestId);

        if (request.getStatus() == RequestStatus.COMPLETED || request.getStatus() == RequestStatus.REJECTED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 처리된 요청입니다.");
        }

        request.reject(adminId, reason);
        AdminRequest saved = requestRepository.save(request);

        log.info("요청 거절 완료: requestId={}, adminId={}, reason={}", requestId, adminId, reason);
        return saved;
    }

    // ── 사용자/호스트 기능 ──

    @Override
    @Transactional
    public AdminRequest createRequest(Long requesterId, RequestCategory category, String title, String content, String attachmentUrl) {
        AdminRequest request = AdminRequest.builder()
                .requesterId(requesterId)
                .category(category)
                .status(RequestStatus.PENDING)
                .title(title)
                .content(content)
                .attachmentUrl(attachmentUrl)
                .build();

        AdminRequest saved = requestRepository.save(request);
        log.info("새 요청 작성: id={}, requesterId={}, category={}", saved.getId(), requesterId, category);
        return saved;
    }

    @Override
    public Page<AdminRequest> getMyRequests(Long requesterId, RequestCategory category, RequestStatus status, Pageable pageable) {
        log.debug("내 요청 목록 조회: requesterId={}, category={}, status={}", requesterId, category, status);
        return requestRepository.findByRequesterIdWithFilters(requesterId, category, status, pageable);
    }

    @Override
    public AdminRequest getMyRequestById(Long requesterId, Long requestId) {
        AdminRequest request = findRequestOrThrow(requestId);

        if (!request.getRequesterId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 요청만 조회할 수 있습니다.");
        }

        return request;
    }
}
