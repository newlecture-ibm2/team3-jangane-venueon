package com.venueon.user.application.service;

import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.user.adapter.in.web.dto.MyPageSummaryResponse;
import com.venueon.user.application.port.in.GetMyPageSummaryUseCase;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageService implements GetMyPageSummaryUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final OrderRepositoryPort orderRepositoryPort;

    @Override
    public MyPageSummaryResponse getSummary(String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        Long userId = user.getId();

        // 1. 참여 중인 세션 = 진행 중(ONGOING) 이벤트의 유효 주문 수
        long ongoingCount = orderRepositoryPort.countOngoingByUserId(userId);

        // 2. 리뷰를 기다리는 세션 = 종료(ENDED) 이벤트의 유효 주문 수
        //    (리뷰 테이블이 아직 없으므로, 종료된 이벤트 전체를 리뷰 대기로 간주)
        long pendingReviewCount = orderRepositoryPort.countCompletedByUserId(userId);

        // 3. 획득한 뱃지 = 아직 DB 테이블 없음, 0 반환
        long earnedBadgeCount = 0L;

        log.debug("마이페이지 요약 조회: email={}, ongoing={}, pendingReview={}, badges={}",
                email, ongoingCount, pendingReviewCount, earnedBadgeCount);

        return new MyPageSummaryResponse(ongoingCount, pendingReviewCount, earnedBadgeCount);
    }
}
