package com.venueon.report.application.port.in;

import com.venueon.report.application.port.in.dto.CreateReportRequest;

public interface CreateReportUseCase {
    void createReport(CreateReportRequest request, String email);
}
