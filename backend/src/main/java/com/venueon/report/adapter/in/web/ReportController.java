package com.venueon.report.adapter.in.web;

import com.venueon.common.annotation.LoginUser;
import com.venueon.report.application.port.in.CreateReportUseCase;
import com.venueon.report.application.port.in.dto.CreateReportRequest;
import com.venueon.report.application.port.in.GetReportQuery;
import com.venueon.report.domain.model.Report;
import com.venueon.user.adapter.in.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final CreateReportUseCase createReportUseCase;
    private final GetReportQuery getReportQuery;

    /**
     * 신고 등록
     * POST /reports
     */
    @PostMapping
    public ResponseEntity<Void> createReport(
            @RequestBody CreateReportRequest request,
            @LoginUser UserPrincipal userPrincipal) {
        
        if (userPrincipal == null || userPrincipal.getUsername().equals("anonymous")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = userPrincipal.getUsername();
        createReportUseCase.createReport(request, email);
        return ResponseEntity.ok().build();
    }

    /**
     * 신고 목록 조회 (어드민용)
     * GET /reports
     */
    @GetMapping
    public ResponseEntity<List<Report>> getReports() {
        return ResponseEntity.ok(getReportQuery.getAllReports());
    }
}
