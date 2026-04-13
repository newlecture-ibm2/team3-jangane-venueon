package com.venueon.report.application.port.in.dto;

import com.venueon.report.domain.model.ReportTargetType;

/**
 * 신고 생성 요청 DTO
 */
public record CreateReportRequest(
    ReportTargetType targetType,
    Long targetId,
    String reason,
    String detail
) {}
