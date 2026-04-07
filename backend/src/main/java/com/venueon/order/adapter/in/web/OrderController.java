package com.venueon.order.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.order.application.service.OrderService;
import com.venueon.order.adapter.in.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 단건 주문 생성 (PENDING 상태)
     * POST /orders
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(
            @RequestParam(defaultValue = "1") Long userId,  // TODO: @AuthenticationPrincipal로 교체
            @Valid @RequestBody CreateOrderRequest request) {

        CreateOrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 토스 결제 승인 요청
     * POST /orders/{id}/confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<ConfirmPaymentResponse>> confirmPayment(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmPaymentRequest request) {

        ConfirmPaymentResponse response = orderService.confirmPayment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 토스 Webhook 결제 검증
     * POST /orders/toss/webhook
     */
    @PostMapping("/toss/webhook")
    public ResponseEntity<Void> handleTossWebhook(@RequestBody Map<String, Object> payload) {
        orderService.handleTossWebhook(payload);
        return ResponseEntity.ok().build();
    }

    /**
     * 주문 상세 조회
     * GET /orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Long userId) {  // TODO: @AuthenticationPrincipal로 교체

        OrderDetailResponse response = orderService.getOrderDetail(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 내 주문/결제 내역
     * GET /orders/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<OrderDetailResponse>>> getMyOrders(
            @RequestParam(defaultValue = "1") Long userId,  // TODO: @AuthenticationPrincipal로 교체
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderDetailResponse> response = orderService.getMyOrders(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
