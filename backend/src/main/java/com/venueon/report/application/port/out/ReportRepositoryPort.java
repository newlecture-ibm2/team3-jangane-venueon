package com.venueon.report.application.port.out;

import com.venueon.report.domain.model.Report;
import java.util.List;

public interface ReportRepositoryPort {
    void save(Report report);
    List<Report> findAll();
}
