package com.venueon.order.application.port.in;

import com.venueon.order.adapter.in.web.dto.MyOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 마이페이지 — 내 수강(주문) 목록 조회 유스케이스
 */
public interface GetMyOrdersUseCase {

    /**
     * @param email 현재 인증된 사용자 이메일
     * @param tab   탭 필터  ("upcoming" | "enrolled" | "completed")
     * @param pageable 페이지네이션
     * @return 주문 + 이벤트 정보를 합친 응답 Page
     */
    Page<MyOrderResponse> getMyOrders(String email, String tab, Pageable pageable);
}
