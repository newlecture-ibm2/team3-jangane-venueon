package com.venueon.admin.request.adapter.in.web;

import com.venueon.admin.request.adapter.in.web.dto.request.ProcessRequestDto;
import com.venueon.admin.request.adapter.in.web.dto.response.AdminRequestDetailResponse;
import com.venueon.admin.request.adapter.in.web.dto.response.AdminRequestListResponse;
import com.venueon.admin.request.application.port.in.ApproveRequestUseCase;
import com.venueon.admin.request.application.port.in.GetAdminRequestsUseCase;
import com.venueon.admin.request.application.port.in.RejectRequestUseCase;
import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
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
 * - GET  /admin/requests          → 요청 목록 (필터: category, status)
 * - GET  /admin/requests/{id}     → 요청 상세
 * - PATCH /admin/requests/{id}/approve → 승인
 * - PATCH /admin/requests/{id}/reject  → 거절
 */
@Slf4j
@RestController
@RequestMapping("/admin/requests")
@RequiredArgsConstructor
public class AdminRequestController {

    private final GetAdminRequestsUseCase getAdminRequestsUseCase;
    private final ApproveRequestUseCase approveRequestUseCase;
    private final RejectRequestUseCase rejectRequestUseCase;

    /**
     * GET /admin/requests — 요청 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminRequestListResponse>>> getRequests(
            @RequestParam(required = false) RequestCategory category,
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.debug("어드민 요청 목록 조회: category={}, status={}", category, status);

        Page<AdminRequest> requests = getAdminRequestsUseCase.getRequests(category, status, pageable);
        Page<AdminRequestListResponse> response = requests.map(AdminRequestListResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /admin/requests/{id} — 요청 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRequestDetailResponse>> getRequest(@PathVariable Long id) {
        log.debug("어드민 요청 상세 조회: id={}", id);

        AdminRequest request = getAdminRequestsUseCase.getRequestById(id);
        AdminRequestDetailResponse response = AdminRequestDetailResponse.from(request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /admin/requests/{id}/approve — 승인
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminRequestDetailResponse>> approveRequest(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ProcessRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long adminId = Long.parseLong(userDetails.getUsername());
        String comment = (dto != null) ? dto.comment() : null;

        log.debug("요청 승인: id={}, adminId={}", id, adminId);

        AdminRequest result = approveRequestUseCase.approve(id, adminId, comment);
        AdminRequestDetailResponse response = AdminRequestDetailResponse.from(result);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /admin/requests/{id}/reject — 거절
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminRequestDetailResponse>> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long adminId = Long.parseLong(userDetails.getUsername());

        log.debug("요청 거절: id={}, adminId={}, reason={}", id, adminId, dto.comment());

        AdminRequest result = rejectRequestUseCase.reject(id, adminId, dto.comment());
        AdminRequestDetailResponse response = AdminRequestDetailResponse.from(result);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
