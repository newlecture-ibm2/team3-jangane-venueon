package com.venueon.report.adapter.out.persistence;

import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.ReportJpaRepository;
import com.venueon.report.application.port.out.ReportRepositoryPort;
import com.venueon.report.domain.model.Report;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReportPersistenceAdapter implements ReportRepositoryPort {

    private final ReportJpaRepository reportJpaRepository;
    private final UserJpaRepository userRepository;

    @Override
    public void save(Report report) {
        UserJpaEntity reporter = userRepository.findById(report.getReporterId())
                .orElseThrow(() -> new IllegalArgumentException("Reporter not found: " + report.getReporterId()));

        ReportJpaEntity entity = ReportJpaEntity.builder()
                .id(report.getId())
                .reporter(reporter)
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .detail(report.getDetail())
                .status(report.getStatus())
                .adminAction(report.getAdminAction())
                .build();

        reportJpaRepository.save(entity);
    }

    @Override
    public List<Report> findAll() {
        return reportJpaRepository.findAll().stream()
                .map(entity -> Report.builder()
                        .id(entity.getId())
                        .reporterId(entity.getReporter().getId())
                        .targetType(entity.getTargetType())
                        .targetId(entity.getTargetId())
                        .reason(entity.getReason())
                        .detail(entity.getDetail())
                        .status(entity.getStatus())
                        .adminAction(entity.getAdminAction())
                        .build())
                .collect(Collectors.toList());
    }
}
