package com.venueon.order.application.service;

import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.order.adapter.out.payment.TossPaymentClient;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.domain.model.Order;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.order.adapter.in.web.dto.*;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepositoryPort orderRepository;
    private final EventJpaRepository eventRepository;
    private final UserJpaRepository userRepository;
    private final TossPaymentClient tossPaymentClient;
    private final com.venueon.report.application.port.in.RequestRefundUseCase requestRefundUseCase;

    @Value("${toss.client-key}")
    private String tossClientKey;

    /**
     * 단건 주문 생성 (PENDING 상태)
     * API 스펙: POST /orders
     */
    @Transactional
    public CreateOrderResponse createOrder(Long userId, CreateOrderRequest request) {
        // 1. 이벤트 존재 여부 확인
        EventJpaEntity event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

        // 2. 유저 조회
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        // 3. 중복 주문 검증 (PAID, REGISTERED 상태인 완료된 주문만)
        List<Order> existingOrders = orderRepository.findByUserIdAndEventIdAndStatusIn(
                userId, request.getEventId(),
                List.of(OrderStatus.PAID, OrderStatus.REGISTERED)
        );
        if (!existingOrders.isEmpty()) {
            throw new BusinessException(ErrorCode.ORDER_ALREADY_EXISTS);
        }

        // 4. 정원 초과 검증
        long currentAttendees = orderRepository.countByEventIdAndStatusIn(
                request.getEventId(),
                List.of(OrderStatus.PAID, OrderStatus.REGISTERED)
        );
        if (event.getMaxAttendees() > 0 && currentAttendees + request.getQuantity() > event.getMaxAttendees()) {
            throw new BusinessException(ErrorCode.EVENT_FULL);
        }

        // 5. 주문 금액 계산
        int totalAmount = event.getPrice() * request.getQuantity();

        // 6. 순수 도메인 모델 생성 및 초기 저장 (ID 발급용)
        Order pendingOrder = Order.createPending(userId, request.getEventId(), request.getQuantity(), totalAmount, request.getPaymentMethod());
        Order savedOrder = orderRepository.save(pendingOrder);

        // 7. tossOrderId 발급 및 도메인 객체 업데이트
        String tossOrderId = "venueon_order_" + savedOrder.getId() + "_" + System.currentTimeMillis();
        savedOrder.updateTossOrderId(tossOrderId);
        
        // 8. 변경된(tossOrderId가 추가된) 도메인 모델 다시 저장
        savedOrder = orderRepository.save(savedOrder);

        log.info("주문 생성 완료: orderId={}, tossOrderId={}, status={}", savedOrder.getId(), tossOrderId, savedOrder.getStatus());

        return CreateOrderResponse.builder()
                .orderId(savedOrder.getId())
                .tossOrderId(tossOrderId)
                .amount(totalAmount)
                .orderName(event.getTitle())
                .customerName(user.getNickname())
                .customerEmail(user.getEmail())
                .tossClientKey(tossClientKey)
                .build();
    }

    /**
     * 토스 결제 승인 요청
     * API 스펙: POST /orders/{id}/confirm
     */
    @Transactional
    public ConfirmPaymentResponse confirmPayment(Long orderId, ConfirmPaymentRequest request) {
        // 1. 주문 모델 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 2. 금액 일치 검증
        if (order.getAmount() != request.getAmount()) {
            log.warn("금액 불일치: DB={}, request={}", order.getAmount(), request.getAmount());
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        // 3. 토스 결제 승인 API 호출 (더미테스트용 키인 경우 패스)
        if (!"dummy_key".equals(request.getPaymentKey())) {
            tossPaymentClient.confirmPayment(
                    request.getPaymentKey(),
                    request.getOrderId(),
                    request.getAmount()
            );
        }

        // 4. 도메인 모델 상태 업데이트 (PENDING → PAID)
        order.confirmPayment(request.getPaymentKey());
        
        // 5. 도메인 모델 저장
        order = orderRepository.save(order);

        log.info("결제 승인 완료: orderId={}, paymentKey={}", orderId, request.getPaymentKey());

        return ConfirmPaymentResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .paidAt(order.getPaidAt())
                .build();
    }

    /**
     * 토스 Webhook 결제 검증
     * API 스펙: POST /orders/toss/webhook
     */
    @Transactional
    public void handleTossWebhook(Map<String, Object> payload) {
        String paymentKey = (String) payload.get("paymentKey");
        String tossOrderId = (String) payload.get("orderId");
        String status = (String) payload.get("status");

        log.info("토스 Webhook 수신: tossOrderId={}, status={}", tossOrderId, status);

        // 1. 주문 모델 조회
        Order order = orderRepository.findByTossOrderId(tossOrderId).orElse(null);

        if (order == null) {
            log.warn("Webhook: 주문을 찾을 수 없습니다. tossOrderId={}", tossOrderId);
            return;
        }

        // 2. 중복 처리 방지
        if (order.getStatus() == OrderStatus.PAID) {
            log.info("Webhook: 이미 결제 완료된 주문입니다. orderId={}", order.getId());
            return;
        }

        // 3. 결제 성공 처리
        if ("DONE".equals(status) && order.getStatus() == OrderStatus.PENDING) {
            order.confirmPayment(paymentKey);
            orderRepository.save(order); // 변경 상태 저장
            log.info("Webhook: 결제 확인 완료. orderId={}", order.getId());
        }
    }

    /**
     * 주문 상세 조회
     * API 스펙: GET /orders/{id}
     */
    public OrderDetailResponse getOrderDetail(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 본인 주문인지 검증
        if (!order.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.ORDER_ACCESS_DENIED);
        }

        return toOrderDetailResponse(order);
    }

    /**
     * 내 주문/결제 내역
     * API 스펙: GET /orders/me
     */
    public Page<OrderDetailResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::toOrderDetailResponse);
    }

    // --- Private Helper ---

    private OrderDetailResponse toOrderDetailResponse(Order order) {
        // Event Title 및 상세 정보를 가져오기 위해 EventJpaRepository 호출 필요
        EventJpaEntity event = eventRepository.findById(order.getEventId()).orElse(null);
        
        String eventTitle = event != null ? event.getTitle() : "알 수 없는 이벤트";
        String organizer = event != null ? "호스트 " + event.getCreator().getId() : "알 수 없는 호스트";
        String location = event != null ? (event.isOnline() ? "온라인" : event.getLocation()) : "-";
        
        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .eventId(order.getEventId())
                .eventTitle(eventTitle)
                .status(order.getStatus().name())
                .quantity(order.getQuantity())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .orderedAt(order.getOrderedAt())
                .paidAt(order.getPaidAt())
                .organizer(organizer)
                .location(location)
                .eventStartDate(event != null ? event.getStartDate() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED))
                .getId();
    }

    @Transactional
    public void requestRefund(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        order.requestRefund();
        orderRepository.save(order);
        
        requestRefundUseCase.requestRefund(orderId, userId, order.getAmount(), reason);
    }
}
