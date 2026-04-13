package com.venueon.admin.report.application.port.in;

import com.venueon.admin.report.adapter.in.web.dto.ReportResponse;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminReportUseCase {
    Page<ReportResponse> getReports(ReportStatus status, ReportTargetType targetType, Pageable pageable);
    void processReport(Long reportId, AdminAction action, ReportStatus status);
}
