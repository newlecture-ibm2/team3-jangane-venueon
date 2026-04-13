package com.venueon.report.adapter.out.persistence.repository;

import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ReportJpaRepository extends JpaRepository<ReportJpaEntity, Long>, JpaSpecificationExecutor<ReportJpaEntity> {

    Page<ReportJpaEntity> findByReporterId(Long reporterId, Pageable pageable);

    Page<ReportJpaEntity> findByStatus(ReportStatus status, Pageable pageable);

    Page<ReportJpaEntity> findByTargetTypeAndStatus(ReportTargetType targetType, ReportStatus status, Pageable pageable);

    Page<ReportJpaEntity> findByTargetType(ReportTargetType targetType, Pageable pageable);

    long countByStatus(ReportStatus status);
}
