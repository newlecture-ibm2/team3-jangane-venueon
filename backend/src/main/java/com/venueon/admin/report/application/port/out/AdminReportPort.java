package com.venueon.admin.report.application.port.out;

import com.venueon.admin.report.adapter.in.web.dto.ReportResponse;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Admin 신고 관리 Port (out) — Hexagonal Architecture
 */
public interface AdminReportPort {

    Page<ReportResponse> findReports(ReportStatus status, ReportTargetType targetType, String keyword, Pageable pageable);

    void processReport(Long reportId, AdminAction action, ReportStatus status);

    ReportTargetType getTargetType(Long reportId);

    Long getTargetId(Long reportId);
}
