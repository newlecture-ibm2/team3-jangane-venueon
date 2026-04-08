package com.venueon.cart.application.port.in;

import com.venueon.cart.application.port.in.dto.CartResponse;
import com.venueon.cart.application.port.in.dto.CartSummaryResponse;

import java.util.List;

/**
 * 장바구니 조회 UseCase (Port-In)
 */
public interface GetCartUseCase {

    /**
     * 사용자의 장바구니 목록 조회
     */
    List<CartResponse> getCartItems(String userEmail);

    /**
     * 장바구니 요약 정보 조회 (총 금액, 할인 등)
     */
    CartSummaryResponse getCartSummary(String userEmail);
}
