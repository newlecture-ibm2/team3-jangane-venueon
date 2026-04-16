package com.venueon.admin.user.application.port.in;

import com.venueon.admin.user.adapter.in.web.dto.response.AdminSummaryResponse;

public interface GetAdminSummaryUseCase {
    AdminSummaryResponse getSummary();
}
