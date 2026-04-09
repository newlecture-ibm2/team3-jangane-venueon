package com.venueon.cart.adapter.in.web;


import com.venueon.cart.application.port.in.*;
import com.venueon.cart.application.port.in.dto.CartResponse;
import com.venueon.cart.application.port.in.dto.CartSummaryResponse;
import com.venueon.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cart REST API Controller
 * Hexagonal Architecture: Adapter Layer (In/Web)
 * Base Path: /cart
 */
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final GetCartUseCase getCartUseCase;
    private final AddToCartUseCase addToCartUseCase;
    private final UpdateCartUseCase updateCartUseCase;
    private final DeleteCartUseCase deleteCartUseCase;

    /**
     * 장바구니 목록 조회
     * GET /cart
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CartResponse>>> getCartItems(
            @AuthenticationPrincipal UserDetails userDetails) {

        String userEmail = userDetails.getUsername();
        List<CartResponse> items = getCartUseCase.getCartItems(userEmail);

        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 장바구니 요약 조회 (총 금액, 할인 등)
     * GET /cart/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCartSummary(
            @AuthenticationPrincipal UserDetails userDetails) {

        String userEmail = userDetails.getUsername();
        CartSummaryResponse summary = getCartUseCase.getCartSummary(userEmail);

        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    /**
     * 장바구니에 이벤트 추가
     * POST /cart
     */
    @PostMapping
    public ResponseEntity<ApiResponse<List<CartResponse>>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddToCartRequest request) {

        String userEmail = userDetails.getUsername();
        List<CartResponse> cartItems = addToCartUseCase.addToCart(userEmail, request.eventId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(cartItems));
    }

    /**
     * 장바구니 항목 수량 변경
     * PATCH /cart/{cartId}
     */
    @PatchMapping("/{cartId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartId,
            @RequestBody UpdateQuantityRequest request) {

        String userEmail = userDetails.getUsername();
        CartResponse updated = updateCartUseCase.updateQuantity(cartId, userEmail, request.quantity());

        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * 장바구니 항목 삭제
     * DELETE /cart/{cartId}
     */
    @DeleteMapping("/{cartId}")
    public ResponseEntity<ApiResponse<Void>> deleteCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartId) {

        String userEmail = userDetails.getUsername();
        deleteCartUseCase.deleteCartItem(cartId, userEmail);

        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * 장바구니 비우기 (모든 항목 삭제)
     * DELETE /cart
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {

        String userEmail = userDetails.getUsername();
        deleteCartUseCase.clearCart(userEmail);

        return ResponseEntity.ok(ApiResponse.success());
    }

    // --- Request Records ---

    public record AddToCartRequest(Long eventId) {}

    public record UpdateQuantityRequest(int quantity) {}
}
