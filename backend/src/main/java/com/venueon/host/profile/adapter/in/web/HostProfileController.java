package com.venueon.host.profile.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.host.common.HostAuthSupport;
import com.venueon.host.profile.adapter.in.web.dto.HostProfileResponse;
import com.venueon.host.profile.adapter.in.web.dto.UpdateHostProfileRequest;
import com.venueon.host.profile.application.port.in.GetHostProfileUseCase;
import com.venueon.host.profile.application.port.in.UpdateHostProfileUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Host 전용 프로필 API — 인증된 Host만 접근 가능.
 *
 * GET  /host/profile  — 내 호스트 프로필 조회
 * PUT  /host/profile  — 내 호스트 프로필 수정
 */
@Slf4j
@RestController
@RequestMapping("/host/profile")
@RequiredArgsConstructor
public class HostProfileController {

    private final GetHostProfileUseCase getHostProfileUseCase;
    private final UpdateHostProfileUseCase updateHostProfileUseCase;
    private final HostAuthSupport hostAuthSupport;

    /**
     * 내 호스트 프로필 조회
     * GET /host/profile
     */
    @GetMapping
    public ResponseEntity<ApiResponse<HostProfileResponse>> getMyProfile(
            Authentication authentication
    ) {
        Long userId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/profile — userId={}", userId);

        HostProfileResponse response = getHostProfileUseCase.getHostProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 내 호스트 프로필 수정
     * PUT /host/profile
     */
    @PutMapping
    public ResponseEntity<ApiResponse<HostProfileResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateHostProfileRequest request
    ) {
        Long userId = hostAuthSupport.extractUserId(authentication);
        log.debug("PUT /host/profile — userId={}, orgName={}", userId, request.getOrgName());

        HostProfileResponse response = updateHostProfileUseCase.updateHostProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
