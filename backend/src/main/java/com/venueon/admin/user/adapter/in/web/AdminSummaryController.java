package com.venueon.admin.user.adapter.in.web;

import com.venueon.admin.user.adapter.in.web.dto.response.AdminSummaryResponse;
import com.venueon.admin.user.application.port.in.GetAdminSummaryUseCase;
import com.venueon.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/admin/summary")
@RequiredArgsConstructor
public class AdminSummaryController {

    private final GetAdminSummaryUseCase getAdminSummaryUseCase;

    /**
     * GET /admin/summary — 어드민 대시보드 요약 정보 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminSummaryResponse>> getSummary() {
        log.debug("어드민 대시보드 요약 정보 조회 시작");
        AdminSummaryResponse summary = getAdminSummaryUseCase.getSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
