package com.venueon.admin.request.adapter.in.web;

import com.venueon.admin.request.adapter.in.web.dto.request.CreateRequestDto;
import com.venueon.admin.request.adapter.in.web.dto.response.AdminRequestDetailResponse;
import com.venueon.admin.request.adapter.in.web.dto.response.AdminRequestListResponse;
import com.venueon.admin.request.application.port.in.UserRequestUseCase;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자/호스트용 요청 컨트롤러
 * - GET  /requests              → 내 요청 목록
 * - POST /requests              → 요청 작성
 * - GET  /requests/{id}         → 내 요청 상세
 */
@Slf4j
@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class UserRequestController {

    private final UserRequestUseCase userRequestUseCase;

    /**
     * GET /requests — 내 요청 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminRequestListResponse>>> getMyRequests(
            @RequestParam(required = false) RequestCategory category,
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        log.debug("내 요청 목록 조회: userId={}, category={}, status={}", userId, category, status);

        Page<AdminRequest> requests = userRequestUseCase.getMyRequests(userId, category, status, pageable);
        Page<AdminRequestListResponse> response = requests.map(AdminRequestListResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /requests — 요청 작성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AdminRequestDetailResponse>> createRequest(
            @Valid @RequestBody CreateRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        log.debug("요청 작성: userId={}, category={}, title={}", userId, dto.category(), dto.title());

        AdminRequest result = userRequestUseCase.createRequest(
                userId,
                dto.category(),
                dto.title(),
                dto.content(),
                dto.attachmentUrl()
        );

        AdminRequestDetailResponse response = AdminRequestDetailResponse.from(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * GET /requests/{id} — 내 요청 상세
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRequestDetailResponse>> getMyRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        log.debug("내 요청 상세 조회: userId={}, requestId={}", userId, id);

        AdminRequest request = userRequestUseCase.getMyRequestById(userId, id);
        AdminRequestDetailResponse response = AdminRequestDetailResponse.from(request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
