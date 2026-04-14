package com.venueon.admin.report.adapter.out.persistence;

import com.venueon.admin.report.adapter.in.web.dto.ReportResponse;
import com.venueon.admin.report.application.port.out.AdminReportPort;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.ReportJpaRepository;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * AdminReportPort 구현체 — JPA 접근은 이 Adapter에서만 수행.
 */
@Component
@RequiredArgsConstructor
public class AdminReportPersistenceAdapter implements AdminReportPort {

    private final ReportJpaRepository reportRepository;

    @Override
    public Page<ReportResponse> findReports(ReportStatus status, ReportTargetType targetType, String keyword, Pageable pageable) {
        Specification<ReportJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!StringUtils.hasText(keyword) && status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (targetType != null) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }
            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(cb.like(cb.lower(root.get("reason")), likePattern));
                searchPredicates.add(cb.like(cb.lower(root.get("detail")), likePattern));
                searchPredicates.add(cb.like(cb.lower(root.get("reporter").get("nickname")), likePattern));
                if (keyword.matches("\\d+")) {
                    searchPredicates.add(cb.equal(root.get("targetId"), Long.parseLong(keyword)));
                }
                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return reportRepository.findAll(spec, pageable).map(ReportResponse::from);
    }

    @Override
    @Transactional
    public void processReport(Long reportId, AdminAction action, ReportStatus status) {
        ReportJpaEntity report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND));
        report.resolve(action, status);
        reportRepository.save(report);
    }

    @Override
    public ReportTargetType getTargetType(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND))
                .getTargetType();
    }

    @Override
    public Long getTargetId(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND))
                .getTargetId();
    }
}
