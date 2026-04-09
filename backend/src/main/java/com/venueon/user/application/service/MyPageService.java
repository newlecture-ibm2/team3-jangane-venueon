package com.venueon.user.application.service;

import com.venueon.user.adapter.in.web.dto.MyPageSummaryResponse;
import com.venueon.user.application.port.in.GetMyPageSummaryUseCase;
import org.springframework.stereotype.Service;

@Service
public class MyPageService implements GetMyPageSummaryUseCase {

    @Override
    public MyPageSummaryResponse getSummary(Long userId) {
        // TODO: OrderRepository, ReviewRepository, BadgeRepository 연동하여 실제 카운트 쿼리 작성 (현재는 연동 준비용 Mock 반환)
        long mockOngoingCourse = 2L;
        long mockPendingReview = 1L;
        long mockEarnedBadge = 5L;

        return new MyPageSummaryResponse(mockOngoingCourse, mockPendingReview, mockEarnedBadge);
    }
}
