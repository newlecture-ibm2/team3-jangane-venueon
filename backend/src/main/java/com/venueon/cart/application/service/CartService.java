package com.venueon.cart.application.service;

import com.venueon.cart.application.port.in.*;
import com.venueon.cart.application.port.in.dto.CartResponse;
import com.venueon.cart.application.port.in.dto.CartSummaryResponse;
import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.cart.application.port.out.LoadEventInfoPort;
import com.venueon.cart.domain.model.Cart;
import com.venueon.common.annotation.UseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 장바구니 서비스 (UseCase 구현체)
 * Hexagonal Architecture: Application Layer
 */
@UseCase
@RequiredArgsConstructor
@Transactional
public class CartService implements GetCartUseCase, AddToCartUseCase, UpdateCartUseCase, DeleteCartUseCase {

    private final CartRepositoryPort cartRepositoryPort;
    private final LoadEventInfoPort loadEventInfoPort;

    // --- 조회 (Query) ---

    @Override
    @Transactional(readOnly = true)
    public List<CartResponse> getCartItems(String userEmail) {
        return cartRepositoryPort.findByUserEmail(userEmail).stream()
                .map(CartResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary(String userEmail) {
        List<Cart> carts = cartRepositoryPort.findByUserEmail(userEmail);
        List<CartResponse> items = carts.stream()
                .map(CartResponse::from)
                .collect(Collectors.toList());

        int totalAmount = carts.stream()
                .mapToInt(cart -> cart.getPrice() * cart.getQuantity())
                .sum();

        int totalDiscount = carts.stream()
                .mapToInt(Cart::getDiscountAmount)
                .sum();

        return new CartSummaryResponse(items, carts.size(), totalAmount, totalDiscount, 0);
    }

    // --- 명령 (Command) ---

    @Override
    public CartResponse addToCart(String userEmail, Long eventId) {
        // 이벤트 정보 조회
        LoadEventInfoPort.EventInfo event = loadEventInfoPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + eventId));

        // 이미 장바구니에 담겨 있는지 확인
        if (cartRepositoryPort.existsByUserEmailAndEventId(userEmail, eventId)) {
            throw new IllegalStateException("이미 장바구니에 담긴 이벤트입니다.");
        }

        // 정원 초과 확인
        if (event.isFull()) {
            throw new IllegalStateException("해당 이벤트는 정원이 초과되었습니다.");
        }

        // 장바구니 항목 생성
        Cart cart = Cart.create(userEmail, eventId, event.title(),
                event.price(), event.getFinalPrice(), event.startDate());

        Cart saved = cartRepositoryPort.save(cart);
        return CartResponse.from(saved);
    }

    @Override
    public CartResponse updateQuantity(Long cartId, String userEmail, int quantity) {
        Cart cart = cartRepositoryPort.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다. ID: " + cartId));

        // 소유권 검증
        if (!cart.isOwnedBy(userEmail)) {
            throw new IllegalStateException("해당 장바구니 항목을 수정할 권한이 없습니다.");
        }

        // 수량 변경
        cart.updateQuantity(quantity);

        Cart saved = cartRepositoryPort.save(cart);
        return CartResponse.from(saved);
    }

    @Override
    public void deleteCartItem(Long cartId, String userEmail) {
        Cart cart = cartRepositoryPort.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다. ID: " + cartId));

        // 소유권 검증
        if (!cart.isOwnedBy(userEmail)) {
            throw new IllegalStateException("해당 장바구니 항목을 삭제할 권한이 없습니다.");
        }

        cartRepositoryPort.deleteById(cartId);
    }

    @Override
    public void clearCart(String userEmail) {
        cartRepositoryPort.deleteByUserEmail(userEmail);
    }
}
