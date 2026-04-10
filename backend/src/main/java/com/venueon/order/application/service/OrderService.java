package com.venueon.order.application.service;

import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.cart.domain.model.Cart;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.order.adapter.out.payment.TossPaymentClient;
import com.venueon.order.application.port.in.RequestRefundUseCase;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.application.port.out.RefundSavePort;
import com.venueon.order.domain.model.Order;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.order.adapter.in.web.dto.*;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.EventSession;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepositoryPort orderRepository;
    private final EventJpaRepository eventRepository;
    private final UserJpaRepository userRepository;
    private final TossPaymentClient tossPaymentClient;
    private final RefundSavePort refundSavePort;
    private final RequestRefundUseCase requestRefundUseCase;
    private final SessionPort sessionPort;
    private final CartRepositoryPort cartRepositoryPort;

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

        // 3. 세션 조회 및 검증
        EventSession session = null;
        if (request.getSessionId() != null) {
            session = sessionPort.findById(request.getSessionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND)); // Session Not Found
            if (!session.getEventId().equals(event.getId())) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
            }
        } else {
            if (event.isHasSession()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE); // 세션이 필수인 이벤트
            }
            session = sessionPort.findDefaultByEventId(event.getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        }

        // 3-2. 중복 주문 검증 (세션 기준)
        List<Order> existingOrders = orderRepository.findByUserIdAndSessionIdAndStatusIn(
                userId, session.getId(),
                List.of(OrderStatus.PAID, OrderStatus.REGISTERED));
        if (!existingOrders.isEmpty()) {
            throw new BusinessException(ErrorCode.ORDER_ALREADY_EXISTS);
        }

        // 4. 정원 초과 검증 (세션 기준)
        long currentAttendees = orderRepository.countBySessionIdAndStatusIn(
                session.getId(),
                List.of(OrderStatus.PAID, OrderStatus.REGISTERED));
        if (session.getMaxAttendees() > 0 && currentAttendees + request.getQuantity() > session.getMaxAttendees()) {
            throw new BusinessException(ErrorCode.EVENT_FULL);
        }

        // 5. 주문 금액 계산 (세션 금액 기준)
        int totalAmount = session.getPrice() * request.getQuantity();

        // 6. 순수 도메인 모델 생성 및 초기 저장
        Order pendingOrder = Order.createPending(userId, request.getEventId(), session.getId(), request.getQuantity(), totalAmount,
                request.getPaymentMethod());
        Order savedOrder = orderRepository.save(pendingOrder);

        // 7. tossOrderId 발급 및 무료 승인 처리
        String tossOrderId = "venueon_order_" + savedOrder.getId() + "_" + System.currentTimeMillis();
        savedOrder.updateTossOrderId(tossOrderId);
        
        // 무료 주문인 경우 즉시 승인 및 참석자 증가
        if (savedOrder.getStatus() == OrderStatus.REGISTERED) {
            session.incrementAttendees(savedOrder.getQuantity());
            sessionPort.save(session, event.getId());
        }

        // 8. 변경된(tossOrderId가 추가된) 도메인 모델 다시 저장
        savedOrder = orderRepository.save(savedOrder);

        log.info("주문 생성 완료: orderId={}, tossOrderId={}, status={}", savedOrder.getId(), tossOrderId,
                savedOrder.getStatus());

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
     * 장바구니 일괄 주문 생성 (PENDING 상태)
     * API 스펙: POST /orders/batch
     */
    @Transactional
    public CreateBatchOrderResponse createBatchOrder(Long userId, String userEmail, CreateBatchOrderRequest request) {
        // 1. 장바구니 항목 조회
        List<Cart> carts = cartRepositoryPort.findAllByIds(request.getCartIds());
        if (carts.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        // 2. 소유권 검증
        for (Cart cart : carts) {
            if (!cart.isOwnedBy(userEmail)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }

        // 3. 유저 조회
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        // 4. 대표 tossOrderId 발급 (시간 기반 고유 값)
        String batchTossOrderId = "venueon_batch_" + userId + "_" + System.currentTimeMillis();

        // 5. 각 장바구니 항목별 Order 생성
        List<Long> orderIds = new ArrayList<>();
        int totalAmount = 0;
        List<String> eventTitles = new ArrayList<>();

        for (Cart cart : carts) {
            // 세션 조회 및 검증
            EventSession session = sessionPort.findById(cart.getSessionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));

            // 중복 주문 검증
            List<Order> existingOrders = orderRepository.findByUserIdAndSessionIdAndStatusIn(
                    userId, session.getId(),
                    List.of(OrderStatus.PAID, OrderStatus.REGISTERED));
            if (!existingOrders.isEmpty()) {
                throw new BusinessException(ErrorCode.ORDER_ALREADY_EXISTS);
            }

            // 정원 초과 검증
            long currentAttendees = orderRepository.countBySessionIdAndStatusIn(
                    session.getId(),
                    List.of(OrderStatus.PAID, OrderStatus.REGISTERED));
            if (session.getMaxAttendees() > 0 && currentAttendees + cart.getQuantity() > session.getMaxAttendees()) {
                throw new BusinessException(ErrorCode.EVENT_FULL);
            }

            // 주문 금액 계산
            int itemAmount = session.getPrice() * cart.getQuantity();
            totalAmount += itemAmount;

            // Order 생성
            Order pendingOrder = Order.createPending(
                    userId, cart.getEventId(), session.getId(),
                    cart.getQuantity(), itemAmount, request.getPaymentMethod());
            Order savedOrder = orderRepository.save(pendingOrder);

            // 동일한 batchTossOrderId 부여
            savedOrder.updateTossOrderId(batchTossOrderId);

            // 무료 주문인 경우 즉시 승인
            if (savedOrder.getStatus() == OrderStatus.REGISTERED) {
                session.incrementAttendees(savedOrder.getQuantity());
                sessionPort.save(session, cart.getEventId());
            }

            savedOrder = orderRepository.save(savedOrder);
            orderIds.add(savedOrder.getId());

            if (!eventTitles.contains(cart.getEventTitle())) {
                eventTitles.add(cart.getEventTitle());
            }
        }

        // 6. 주문명 생성
        String orderName = eventTitles.size() == 1
                ? eventTitles.get(0)
                : eventTitles.get(0) + " 외 " + (eventTitles.size() - 1) + "건";

        log.info("일괄 주문 생성 완료: orderIds={}, tossOrderId={}, totalAmount={}",
                orderIds, batchTossOrderId, totalAmount);

        return CreateBatchOrderResponse.builder()
                .orderIds(orderIds)
                .tossOrderId(batchTossOrderId)
                .totalAmount(totalAmount)
                .orderName(orderName)
                .customerName(user.getNickname())
                .customerEmail(user.getEmail())
                .tossClientKey(tossClientKey)
                .build();
    }

    /**
     * 토스 결제 승인 요청 (단건 + 일괄 주문 모두 지원)
     * API 스펙: POST /orders/{id}/confirm
     */
    @Transactional
    public ConfirmPaymentResponse confirmPayment(Long orderId, ConfirmPaymentRequest request) {
        // 1. 대표 주문 모델 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 2. 동일 tossOrderId를 가진 모든 주문 조회 (일괄 주문 지원)
        List<Order> relatedOrders = orderRepository.findAllByTossOrderId(order.getTossOrderId());

        // 3. 합산 금액 검증
        int totalAmount = relatedOrders.stream().mapToInt(Order::getAmount).sum();
        if (totalAmount != request.getAmount()) {
            log.warn("금액 불일치: DB 합산={}, request={}", totalAmount, request.getAmount());
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        // 4. 토스 결제 승인 API 호출 (더미테스트용 키인 경우 패스)
        if (!"dummy_key".equals(request.getPaymentKey())) {
            tossPaymentClient.confirmPayment(
                    request.getPaymentKey(),
                    request.getOrderId(),
                    request.getAmount());
        }

        // 5. 모든 관련 주문의 상태를 PAID로 전환 + 세션 참석자 업데이트
        for (Order relatedOrder : relatedOrders) {
            if (relatedOrder.getStatus() == OrderStatus.PENDING) {
                relatedOrder.confirmPayment(request.getPaymentKey());
                orderRepository.save(relatedOrder);

                // 세션 참석자 업데이트
                if (relatedOrder.getSessionId() != null) {
                    int qty = relatedOrder.getQuantity();
                    Long evtId = relatedOrder.getEventId();
                    sessionPort.findById(relatedOrder.getSessionId()).ifPresent(session -> {
                        session.incrementAttendees(qty);
                        sessionPort.save(session, evtId);
                    });
                }
            }
        }

        // 6. 일괄 주문(batch)인 경우 장바구니 항목 삭제
        if (order.getTossOrderId() != null && order.getTossOrderId().startsWith("venueon_batch_")) {
            try {
                // 결제 완료된 주문들의 sessionId로 장바구니 항목을 찾아 삭제
                String userEmail = userRepository.findById(order.getUserId())
                        .map(UserJpaEntity::getEmail).orElse(null);
                if (userEmail != null) {
                    for (Order relatedOrder : relatedOrders) {
                        if (relatedOrder.getSessionId() != null) {
                            cartRepositoryPort.findByUserEmailAndSessionId(userEmail, relatedOrder.getSessionId())
                                    .ifPresent(cart -> cartRepositoryPort.deleteById(cart.getId()));
                        }
                    }
                }
                log.info("결제 완료 후 장바구니 항목 삭제 완료");
            } catch (Exception e) {
                log.warn("장바구니 항목 삭제 중 오류 (결제는 정상 처리됨): {}", e.getMessage());
            }
        }

        log.info("결제 승인 완료: orderId={}, paymentKey={}, relatedOrders={}",
                orderId, request.getPaymentKey(), relatedOrders.size());

        // 7. 반환할 주문 객체 최신화 (PAID 상태 반영)
        // relatedOrders 리스트에서 현재 orderId와 일치하는 인스턴스를 찾거나, 상태를 직접 동기화
        Order confirmedOrder = relatedOrders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElse(order); // 만약 못 찾으면 기존 order 반환 (거의 일어날 수 없음)

        // 이벤트명(강의명) 조회
        String orderName = eventRepository.findById(confirmedOrder.getEventId())
                .map(EventJpaEntity::getTitle)
                .orElse("VenueOn 강의");
        if (relatedOrders.size() > 1) {
            orderName = orderName + " 외 " + (relatedOrders.size() - 1) + "건";
        }

        return ConfirmPaymentResponse.builder()
                .orderId(confirmedOrder.getId())
                .orderName(orderName)
                .status(confirmedOrder.getStatus().name())
                .amount(totalAmount)
                .paymentMethod(confirmedOrder.getPaymentMethod())
                .paidAt(confirmedOrder.getPaidAt())
                .build();
    }

    /**
     * 토스 Webhook 결제 검증
     * API 스펙: POST /orders/toss/webhook
     */
    @Transactional
    public void handleTossWebhook(Map<String, Object> payload) {
        log.info("토스 Webhook 원본 수신: {}", payload);

        // 토스 웹훅은 보통 "data" 필드 안에 실제 상태값들이 들어 있습니다.
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) payload.getOrDefault("data", payload);

        String paymentKey = (String) data.get("paymentKey");
        String tossOrderId = (String) data.get("orderId");
        String status = (String) data.get("status");

        log.info("토스 Webhook 파싱: tossOrderId={}, status={}", tossOrderId, status);

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
            
            // 참석자 업데이트
            int qty = order.getQuantity();
            Long evtId = order.getEventId();
            if (order.getSessionId() != null) {
                sessionPort.findById(order.getSessionId()).ifPresent(session -> {
                    session.incrementAttendees(qty);
                    sessionPort.save(session, evtId);
                });
            }
            
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
    public Page<OrderDetailResponse> getMyOrders(Long userId, String tab, Pageable pageable) {
        return orderRepository.findValidOrdersByUserId(userId, tab, pageable)
                .map(this::toOrderDetailResponse);
    }

    /**
     * 참가 취소 (환불)
     * API 스펙: POST /orders/{id}/refund
     */
    @Transactional
    public CancelOrderResponse cancelOrder(Long orderId, Long userId, String reason) {
        // 1. 주문 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 2. 본인 주문인지 검증
        if (!order.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.ORDER_ACCESS_DENIED);
        }

        // 3. 이미 환불된 주문인지 검증
        if (order.getStatus() == OrderStatus.REFUNDED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.ALREADY_REFUNDED);
        }

        // 4. 환불 가능한 상태인지 검증 (PAID 상태만 환불 가능)
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BusinessException(ErrorCode.REFUND_NOT_ALLOWED);
        }

        // 5. 토스 결제 취소 API 호출 (실제 결제건만)
        if (order.getTossPaymentKey() != null && !"dummy_key".equals(order.getTossPaymentKey())) {
            tossPaymentClient.cancelPayment(order.getTossPaymentKey(), reason);
        }

        // 6. 도메인 상태 변경
        order.refund();
        orderRepository.save(order);
        
        // 세션 참석자 감소
        int qty = order.getQuantity();
        Long evtId = order.getEventId();
        if (order.getSessionId() != null) {
            sessionPort.findById(order.getSessionId()).ifPresent(session -> {
                session.decrementAttendees(qty);
                sessionPort.save(session, evtId);
            });
        }

        // 7. refunds 테이블에 환불 이력 저장
        refundSavePort.saveRefundRecord(orderId, userId, order.getAmount(), reason);

        log.info("환불 완료: orderId={}, reason={}", orderId, reason);

        // 이벤트명 조회
        String eventTitle = eventRepository.findById(order.getEventId())
                .map(EventJpaEntity::getTitle)
                .orElse("알 수 없는 이벤트");

        return CancelOrderResponse.builder()
                .orderId(order.getId())
                .eventTitle(eventTitle)
                .amount(order.getAmount())
                .status(order.getStatus().name())
                .reason(reason)
                .cancelledAt(LocalDateTime.now())
                .build();
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
                .eventStatus(event != null ? event.getStatus().name() : "DRAFT")
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
