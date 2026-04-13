package com.venueon.report.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.report.application.port.in.CreateReportUseCase;
import com.venueon.report.application.port.in.dto.CreateReportRequest;
import com.venueon.report.application.port.out.ReportRepositoryPort;
import com.venueon.report.domain.model.Report;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
@Transactional
public class ReportCommandService implements CreateReportUseCase {

    private final ReportRepositoryPort reportRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    public void createReport(CreateReportRequest request, String email) {
        User reporter = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Report report = Report.create(
                reporter.getId(),
                request.targetType(),
                request.targetId(),
                request.reason(),
                request.detail()
        );

        reportRepositoryPort.save(report);
    }
}
