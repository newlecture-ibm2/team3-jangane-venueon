package com.venueon.report.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.report.application.port.in.GetReportQuery;
import com.venueon.report.application.port.out.ReportRepositoryPort;
import com.venueon.report.domain.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@UseCase
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportQueryService implements GetReportQuery {

    private final ReportRepositoryPort reportRepositoryPort;

    @Override
    public List<Report> getAllReports() {
        return reportRepositoryPort.findAll();
    }
}
