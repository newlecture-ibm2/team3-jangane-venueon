package com.venueon.cart.application.service;

import com.venueon.cart.application.port.in.*;
import com.venueon.cart.application.port.in.dto.CartResponse;
import com.venueon.cart.application.port.in.dto.CartSummaryResponse;
import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.cart.domain.model.Cart;
import com.venueon.common.annotation.UseCase;
import com.venueon.ticket.application.port.out.TicketRepositoryPort;
import com.venueon.ticket.domain.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 장바구니 서비스 (UseCase 구현체)
 * Hexagonal Architecture: Application Layer
 *
 * v6: 이벤트/세션 기반 → 티켓 기반으로 전환
 * - LoadEventInfoPort 의존 제거
 * - SessionJpaRepository 직접 참조 제거 (Hexagonal Architecture 원칙 준수)
 * - TicketRepositoryPort 의존 추가
 */
@UseCase
@RequiredArgsConstructor
@Transactional
public class CartService implements GetCartUseCase, AddToCartUseCase, UpdateCartUseCase, DeleteCartUseCase {

    private final CartRepositoryPort cartRepositoryPort;
    private final TicketRepositoryPort ticketRepositoryPort;

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
                .mapToInt(cart -> cart.getTicketOriginalPrice() * cart.getQuantity())
                .sum();

        int totalDiscount = carts.stream()
                .mapToInt(Cart::getDiscountAmount)
                .sum();

        int finalAmount = carts.stream()
                .mapToInt(Cart::getSubtotal)
                .sum();

        return new CartSummaryResponse(items, carts.size(), totalAmount, totalDiscount, finalAmount);
    }

    // --- 명령 (Command) ---

    @Override
    public CartResponse addToCart(String userEmail, Long ticketId, int quantity) {
        // 1. 티켓 존재 확인
        Ticket ticket = ticketRepositoryPort.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + ticketId));

        // 2. 판매 중인지 확인
        if (!ticket.isOnSale()) {
            throw new IllegalStateException("현재 판매 중이 아닌 티켓입니다.");
        }

        // 3. 중복 확인 (동일 티켓이 이미 장바구니에 있는지)
        if (cartRepositoryPort.existsByUserEmailAndTicketId(userEmail, ticketId)) {
            throw new IllegalStateException("이미 장바구니에 담겨 있는 티켓입니다.");
        }

        // 4. 이벤트 제목 조회를 위해 티켓의 eventId 사용
        // TicketRepositoryPort에서 반환한 Ticket에는 eventId가 포함되어 있음
        // eventTitle은 CartMapper.toDomain()에서 ticket → event 관계를 통해 설정됨

        // 5. Cart 도메인 모델 생성
        Cart cart = Cart.create(
                userEmail,
                ticket.getEventId(),
                null, // eventTitle — save 후 toDomain에서 ticket.event를 통해 설정됨
                ticketId,
                ticket.getName(),
                ticket.getPrice(),
                ticket.getOriginalPrice(),
                quantity
        );

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
