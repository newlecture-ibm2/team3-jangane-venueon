package com.venueon.admin.report.application.service;

import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.admin.user.application.port.in.ChangeAdminUserStatusUseCase;
import com.venueon.admin.user.application.port.in.DeleteAdminUserUseCase;
import com.venueon.comment.application.port.in.CommentAdminUseCase;
import com.venueon.event.application.port.in.DeleteEventUseCase;
import com.venueon.post.application.port.in.PostAdminUseCase;
import com.venueon.admin.report.adapter.in.web.dto.ReportResponse;
import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.ReportJpaRepository;
import com.venueon.admin.report.application.port.in.AdminReportUseCase;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService implements AdminReportUseCase {

    private final ReportJpaRepository reportRepository;
    private final PostAdminUseCase postAdminUseCase;
    private final CommentAdminUseCase commentAdminUseCase;
    private final ChangeAdminUserStatusUseCase changeAdminUserStatusUseCase;
    private final DeleteAdminUserUseCase deleteAdminUserUseCase;
    private final DeleteEventUseCase deleteEventUseCase;

    @Override
    public Page<ReportResponse> getReports(ReportStatus status, ReportTargetType targetType, Pageable pageable) {
        Page<ReportJpaEntity> reports;
        if (status != null && targetType != null) {
            reports = reportRepository.findByTargetTypeAndStatus(targetType, status, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else if (targetType != null) {
            reports = reportRepository.findByTargetType(targetType, pageable);
        } else {
            reports = reportRepository.findAll(pageable);
        }
        
        return reports.map(ReportResponse::from);
    }

    @Override
    @Transactional
    public void processReport(Long reportId, AdminAction action, ReportStatus status) {
        ReportJpaEntity report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND));

        report.resolve(action, status);
        reportRepository.save(report);

        // 실질적인 제재 로직 (RESOLVED 상태일 때만)
        if (status == ReportStatus.RESOLVED) {
            executeAdminAction(report.getTargetType(), report.getTargetId(), action);
        }
    }

    private void executeAdminAction(ReportTargetType targetType, Long targetId, AdminAction action) {
        switch (targetType) {
            case POST -> {
                if (action == AdminAction.DELETE) postAdminUseCase.deletePost(targetId);
                else if (action == AdminAction.HIDE) postAdminUseCase.hidePost(targetId);
            }
            case COMMENT -> {
                if (action == AdminAction.DELETE) commentAdminUseCase.deleteComment(targetId);
                else if (action == AdminAction.HIDE) commentAdminUseCase.hideComment(targetId);
            }
            case USER -> {
                if (action == AdminAction.DELETE) deleteAdminUserUseCase.deleteUser(targetId);
                else if (action == AdminAction.WARN || action == AdminAction.HIDE)
                    changeAdminUserStatusUseCase.changeStatus(targetId, false); // 계정 비활성화
            }
            case EVENT -> {
                if (action == AdminAction.DELETE) deleteEventUseCase.deleteEvent(targetId, null, "ADMIN");
            }
        }
    }
}
