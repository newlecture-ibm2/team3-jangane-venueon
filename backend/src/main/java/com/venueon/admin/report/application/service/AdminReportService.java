package com.venueon.admin.report.application.service;

import com.venueon.admin.user.application.port.in.ChangeAdminUserStatusUseCase;
import com.venueon.admin.user.application.port.in.DeleteAdminUserUseCase;
import com.venueon.manager.comment.application.port.in.CommentManagerUseCase;
import com.venueon.event.application.port.in.DeleteEventUseCase;
import com.venueon.manager.post.application.port.in.PostManagerUseCase;
import com.venueon.admin.report.adapter.in.web.dto.ReportResponse;
import com.venueon.admin.report.application.port.in.AdminReportUseCase;
import com.venueon.admin.report.application.port.out.AdminReportPort;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin 신고 처리 서비스
 * — Port 인터페이스만 의존 (JPA 직접 참조 제거)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService implements AdminReportUseCase {

    private final AdminReportPort adminReportPort;
    private final PostManagerUseCase postManagerUseCase;
    private final CommentManagerUseCase commentManagerUseCase;
    private final ChangeAdminUserStatusUseCase changeAdminUserStatusUseCase;
    private final DeleteAdminUserUseCase deleteAdminUserUseCase;
    private final DeleteEventUseCase deleteEventUseCase;

    @Override
    public Page<ReportResponse> getReports(ReportStatus status, ReportTargetType targetType, String keyword, Pageable pageable) {
        log.info("신고 목록 조회 요청: status={}, targetType={}, keyword={}", status, targetType, keyword);
        return adminReportPort.findReports(status, targetType, keyword, pageable);
    }

    @Override
    @Transactional
    public void processReport(Long reportId, AdminAction action, ReportStatus status) {
        // 1. 신고 상태 변경 (Adapter 경유)
        ReportTargetType targetType = adminReportPort.getTargetType(reportId);
        Long targetId = adminReportPort.getTargetId(reportId);

        adminReportPort.processReport(reportId, action, status);

        // 2. 실제 조치 실행
        if (status == ReportStatus.RESOLVED) {
            executeAdminAction(targetType, targetId, action);
        }
    }

    private void executeAdminAction(ReportTargetType targetType, Long targetId, AdminAction action) {
        switch (targetType) {
            case POST -> {
                if (action == AdminAction.DELETE) postManagerUseCase.deletePost(targetId, "admin@venueon.com");
                else if (action == AdminAction.HIDE) postManagerUseCase.hidePost(targetId, "admin@venueon.com");
            }
            case COMMENT -> {
                if (action == AdminAction.DELETE) commentManagerUseCase.deleteComment(targetId, "admin@venueon.com");
                else if (action == AdminAction.HIDE) commentManagerUseCase.hideComment(targetId, "admin@venueon.com");
            }
            case USER -> {
                if (action == AdminAction.DELETE) deleteAdminUserUseCase.deleteUser(targetId);
                else if (action == AdminAction.WARN || action == AdminAction.HIDE)
                    changeAdminUserStatusUseCase.changeStatus(targetId, false);
            }
            case EVENT -> {
                if (action == AdminAction.DELETE) deleteEventUseCase.deleteEvent(targetId, null, "ADMIN");
            }
        }
    }
}
