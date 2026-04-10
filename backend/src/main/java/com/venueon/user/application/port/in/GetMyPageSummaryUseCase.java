package com.venueon.user.application.port.in;

import com.venueon.user.adapter.in.web.dto.MyPageSummaryResponse;

public interface GetMyPageSummaryUseCase {
    MyPageSummaryResponse getSummary(String email);
}
