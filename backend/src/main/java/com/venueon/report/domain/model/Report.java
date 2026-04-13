package com.venueon.report.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class Report {
    private Long id;
    private Long reporterId;
    private ReportTargetType targetType;
    private Long targetId;
    private String reason;
    private String detail;
    private ReportStatus status;
    private AdminAction adminAction;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public static Report create(Long reporterId, ReportTargetType targetType, Long targetId, String reason, String detail) {
        return Report.builder()
                .reporterId(reporterId)
                .targetType(targetType)
                .targetId(targetId)
                .reason(reason)
                .detail(detail)
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
