package com.venueon.report.application.port.in;

import com.venueon.report.domain.model.Report;
import java.util.List;

public interface GetReportQuery {
    List<Report> getAllReports();
}
