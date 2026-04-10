package com.venueon.report.application.port.in;

import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminReportUseCase {
    Page<ReportJpaEntity> getReports(ReportStatus status, ReportTargetType targetType, Pageable pageable);
    void processReport(Long reportId, AdminAction action, ReportStatus status);
}
