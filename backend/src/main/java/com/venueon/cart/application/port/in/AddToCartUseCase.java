package com.venueon.cart.application.port.in;

import com.venueon.cart.application.port.in.dto.CartResponse;

import java.util.List;

/**
 * 장바구니 추가 UseCase (Port-In)
 */
public interface AddToCartUseCase {

    /**
     * 이벤트를 장바구니에 추가 (해당 이벤트의 모든 세션을 추가)
     * @param userEmail 사용자 이메일
     * @param eventId 이벤트 ID
     * @return 추가된 장바구니 항목 목록
     * @throws IllegalArgumentException 이벤트를 찾을 수 없음
     * @throws IllegalStateException 이미 장바구니에 담김, 정원 초과 등
     */
    List<CartResponse> addToCart(String userEmail, Long eventId);
}
