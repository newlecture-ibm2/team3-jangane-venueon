package com.venueon.report.adapter.in.web.dto;

import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.ReportStatus;
import jakarta.validation.constraints.NotNull;

public record ReportActionRequest(
    @NotNull AdminAction action,
    @NotNull ReportStatus status
) {
}
