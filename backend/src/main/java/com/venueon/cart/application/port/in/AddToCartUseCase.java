package com.venueon.cart.application.port.in;

import com.venueon.cart.application.port.in.dto.CartResponse;

/**
 * 장바구니 추가 UseCase (Port-In)
 *
 * v6: eventId 기반 → ticketId 기반으로 전환
 */
public interface AddToCartUseCase {

    /**
     * 티켓을 장바구니에 추가
     * @param userEmail 사용자 이메일
     * @param ticketId 티켓 ID
     * @param quantity 수량
     * @return 추가된 장바구니 항목
     * @throws IllegalArgumentException 티켓을 찾을 수 없음
     * @throws IllegalStateException 이미 장바구니에 담김
     */
    CartResponse addToCart(String userEmail, Long ticketId, int quantity);
}
