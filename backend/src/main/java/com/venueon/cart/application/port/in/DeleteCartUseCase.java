package com.venueon.cart.application.port.in;

/**
 * 장바구니 삭제 UseCase (Port-In)
 */
public interface DeleteCartUseCase {

    /**
     * 장바구니 항목 삭제
     * @param cartId 장바구니 ID
     * @param userId 사용자 ID (소유권 검증용)
     * @throws IllegalArgumentException 장바구니 항목을 찾을 수 없음
     * @throws IllegalStateException 권한 없음
     */
    void deleteCartItem(Long cartId, Long userId);

    /**
     * 사용자의 모든 장바구니 항목 삭제 (주문 완료 후 등)
     */
    void clearCart(Long userId);
}
