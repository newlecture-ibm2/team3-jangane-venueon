package com.venueon.admin.report.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.admin.report.adapter.in.web.dto.ReportActionRequest;
import com.venueon.admin.report.adapter.in.web.dto.ReportResponse;
import com.venueon.admin.report.application.port.in.AdminReportUseCase;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportUseCase adminReportUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportTargetType targetType,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ReportResponse> response = adminReportUseCase.getReports(status, targetType, pageable);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> processReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportActionRequest request) {

        adminReportUseCase.processReport(id, request.action(), request.status());

        return ResponseEntity.ok(ApiResponse.success());
    }
}
