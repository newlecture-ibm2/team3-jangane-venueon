package com.venueon.report.adapter.in.web.dto;

import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ReportResponse {

    private Long id;
    private Long reporterId;
    private String reporterNickname;
    private ReportTargetType targetType;
    private Long targetId;
    private String reason;
    private String detail;
    private ReportStatus status;
    private AdminAction adminAction;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @Builder
    private ReportResponse(Long id, Long reporterId, String reporterNickname, ReportTargetType targetType, 
                           Long targetId, String reason, String detail, ReportStatus status, 
                           AdminAction adminAction, LocalDateTime createdAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.reporterId = reporterId;
        this.reporterNickname = reporterNickname;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.detail = detail;
        this.status = status;
        this.adminAction = adminAction;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }

    public static ReportResponse from(ReportJpaEntity entity) {
        return ReportResponse.builder()
                .id(entity.getId())
                .reporterId(entity.getReporter().getId())
                .reporterNickname(entity.getReporter().getNickname())
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .reason(entity.getReason())
                .detail(entity.getDetail())
                .status(entity.getStatus())
                .adminAction(entity.getAdminAction())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())
                .build();
    }
}
