package com.venueon.cart.application.port.in;

import com.venueon.cart.application.port.in.dto.CartResponse;

/**
 * 장바구니 수량 변경 UseCase (Port-In)
 */
public interface UpdateCartUseCase {

    /**
     * 장바구니 항목 수량 변경
     * @param cartId 장바구니 ID
     * @param userId 사용자 ID (소유권 검증용)
     * @param quantity 변경할 수량
     * @return 변경된 장바구니 항목
     * @throws IllegalArgumentException 유효하지 않은 수량
     * @throws IllegalStateException 권한 없음
     */
    CartResponse updateQuantity(Long cartId, Long userId, int quantity);
}
