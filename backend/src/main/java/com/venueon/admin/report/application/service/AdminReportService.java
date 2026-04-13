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
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
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
    public Page<ReportResponse> getReports(ReportStatus status, ReportTargetType targetType, String keyword, Pageable pageable) {
        log.info("신고 목록 조회 요청: status={}, targetType={}, keyword={}", status, targetType, keyword);
        
        Specification<ReportJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 검색어가 있는 경우: 상태 필터(status)를 무시하고 전체 상태에서 검색
            // 2. 검색어가 없는 경우: 선택된 상태 필름(status) 적용
            if (!StringUtils.hasText(keyword) && status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 탭(targetType)은 화면 레이아웃 유지를 위해 항상 적용
            if (targetType != null) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }

            // 검색어 필터링 로직
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
                    changeAdminUserStatusUseCase.changeStatus(targetId, false);
            }
            case EVENT -> {
                if (action == AdminAction.DELETE) deleteEventUseCase.deleteEvent(targetId, null, "ADMIN");
            }
        }
    }
}
