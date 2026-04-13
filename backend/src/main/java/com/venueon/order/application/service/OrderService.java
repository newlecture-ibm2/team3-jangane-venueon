package com.venueon.order.application.service;

import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.domain.model.RecruitmentStatus;
import com.venueon.order.adapter.out.payment.TossPaymentClient;
import com.venueon.order.application.port.in.RequestRefundUseCase;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.application.port.out.RefundSavePort;
import com.venueon.order.domain.model.Order;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.order.adapter.in.web.dto.*;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.Session;
import com.venueon.ticket.application.port.out.TicketRepositoryPort;
import com.venueon.ticket.domain.model.Ticket;
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

/**
 * 주문 서비스
 *
 * v6: session 기반 → ticket 기반 전환
 * - 이중 게이트 검증 (티켓 재고 + 세션 정원) 구현
 * - 단건/배치 주문 통합 (createBatchOrder 제거)
 * - 환불 시 티켓 재고 + 세션 정원 복구
 */
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
    private final TicketRepositoryPort ticketRepositoryPort;

    @Value("${toss.client-key}")
    private String tossClientKey;

    /**
     * 통합 주문 생성 (단건/다건 모두 지원)
     * API 스펙: POST /orders
     *
     * 이중 게이트 검증:
     * Gate 1: 티켓 재고 검증 (hasStock)
     * Gate 2: 연결된 모든 세션 정원 검증 (hasCapacity)
     * Gate 3: 모집 상태 검증 (OPEN)
     */
    @Transactional
    public CreateOrderResponse createOrder(Long userId, CreateOrderRequest request) {
        // 1. 유저 조회
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        // 2. 공유 tossOrderId 발급
        String tossOrderId = "venueon_order_" + userId + "_" + System.currentTimeMillis();

        List<Long> orderIds = new ArrayList<>();
        int totalAmount = 0;
        List<String> eventTitles = new ArrayList<>();

        // 3. 각 항목별 검증 및 주문 생성
        for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
            // 3-1. 티켓 조회
            Ticket ticket = ticketRepositoryPort.findById(item.getTicketId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT_VALUE));

            // 3-2. 이벤트 존재 확인
            EventJpaEntity event = eventRepository.findById(ticket.getEventId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

            // === Gate 1: 티켓 판매 상태 + 재고 검증 ===
            if (!ticket.isOnSale()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
            }
            if (!ticket.hasStock(item.getQuantity())) {
                throw new BusinessException(ErrorCode.EVENT_FULL);
            }

            // === Gate 2: 연결된 모든 세션 정원 검증 ===
            List<Session> linkedSessions = resolveTicketSessions(ticket);
            for (Session session : linkedSessions) {
                if (!session.hasCapacity(item.getQuantity())) {
                    throw new BusinessException(ErrorCode.EVENT_FULL);
                }
            }

            // === Gate 3: 모집 상태 검증 ===
            for (Session session : linkedSessions) {
                if (session.getRecruitmentStatus() != RecruitmentStatus.OPEN) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
                }
            }

            // 3-3. 중복 구매 검증 (동일 티켓 중복 방지)
            List<Order> existingOrders = orderRepository.findByUserIdAndTicketIdAndStatusIn(
                    userId, ticket.getId(),
                    List.of(OrderStatus.PAID, OrderStatus.REGISTERED));
            if (!existingOrders.isEmpty()) {
                throw new BusinessException(ErrorCode.ORDER_ALREADY_EXISTS);
            }

            // 3-4. 주문 금액 계산
            int itemAmount = ticket.getPrice() * item.getQuantity();
            totalAmount += itemAmount;

            // 3-5. 티켓 재고 차감
            ticket.decreaseStock(item.getQuantity());
            ticketRepositoryPort.updateSoldCount(ticket.getId(), ticket.getSoldCount());

            // 3-6. 주문 도메인 모델 생성
            Order pendingOrder = Order.createPending(
                    userId, ticket.getEventId(), ticket.getId(),
                    item.getQuantity(), itemAmount, request.getPaymentMethod());
            pendingOrder.updateTossOrderId(tossOrderId);

            // 3-7. 무료 주문인 경우 즉시 등록 + 세션 참석자 증가
            if (pendingOrder.getStatus() == OrderStatus.REGISTERED) {
                for (Session session : linkedSessions) {
                    session.incrementAttendees(item.getQuantity());
                    sessionPort.save(session, ticket.getEventId());
                }
            }

            Order savedOrder = orderRepository.save(pendingOrder);
            orderIds.add(savedOrder.getId());

            if (!eventTitles.contains(event.getTitle())) {
                eventTitles.add(event.getTitle());
            }
        }

        // 4. 주문명 생성
        String orderName = buildOrderName(eventTitles);

        log.info("주문 생성 완료: orderIds={}, tossOrderId={}, totalAmount={}",
                orderIds, tossOrderId, totalAmount);

        return CreateOrderResponse.builder()
                .orderIds(orderIds)
                .tossOrderId(tossOrderId)
                .totalAmount(totalAmount)
                .orderName(orderName)
                .customerName(user.getNickname())
                .customerEmail(user.getEmail())
                .tossClientKey(tossClientKey)
                .build();
    }

    /**
     * 토스 결제 승인 요청 (tossOrderId 기반 일괄 처리)
     * API 스펙: POST /orders/{id}/confirm
     */
    @Transactional
    public ConfirmPaymentResponse confirmPayment(Long orderId, ConfirmPaymentRequest request) {
        // 1. 대표 주문 모델 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 2. 동일 tossOrderId를 가진 모든 주문 조회
        List<Order> relatedOrders = orderRepository.findAllByTossOrderId(order.getTossOrderId());

        // 3. 합산 금액 검증
        int totalAmount = relatedOrders.stream().mapToInt(Order::getAmount).sum();
        if (totalAmount != request.getAmount()) {
            log.warn("금액 불일치: DB 합산={}, request={}", totalAmount, request.getAmount());
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        // 4. 토스 결제 승인 API 호출
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

                // 티켓의 연결된 세션들 참석자 증가
                if (relatedOrder.getTicketId() != null) {
                    ticketRepositoryPort.findById(relatedOrder.getTicketId()).ifPresent(ticket -> {
                        int qty = relatedOrder.getQuantity();
                        List<Session> sessions = resolveTicketSessions(ticket);
                        for (Session session : sessions) {
                            session.incrementAttendees(qty);
                            sessionPort.save(session, ticket.getEventId());
                        }
                    });
                }
            }
        }

        // 6. 결제 완료 후 장바구니 항목 삭제
        try {
            String userEmail = userRepository.findById(order.getUserId())
                    .map(UserJpaEntity::getEmail).orElse(null);
            if (userEmail != null) {
                for (Order relatedOrder : relatedOrders) {
                    if (relatedOrder.getTicketId() != null) {
                        cartRepositoryPort.findByUserEmailAndTicketId(userEmail, relatedOrder.getTicketId())
                                .ifPresent(cart -> cartRepositoryPort.deleteById(cart.getId()));
                    }
                }
            }
            log.info("결제 완료 후 장바구니 항목 삭제 완료");
        } catch (Exception e) {
            log.warn("장바구니 항목 삭제 중 오류 (결제는 정상 처리됨): {}", e.getMessage());
        }

        log.info("결제 승인 완료: orderId={}, paymentKey={}, relatedOrders={}",
                orderId, request.getPaymentKey(), relatedOrders.size());

        // 7. 반환할 주문 객체 최신화
        Order confirmedOrder = relatedOrders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElse(order);

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
            orderRepository.save(order);

            // 티켓의 연결된 세션 참석자 업데이트
            if (order.getTicketId() != null) {
                ticketRepositoryPort.findById(order.getTicketId()).ifPresent(ticket -> {
                    int qty = order.getQuantity();
                    List<Session> sessions = resolveTicketSessions(ticket);
                    for (Session session : sessions) {
                        session.incrementAttendees(qty);
                        sessionPort.save(session, ticket.getEventId());
                    }
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

        if (!order.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.ORDER_ACCESS_DENIED);
        }

        return toOrderDetailResponse(order);
    }

    /**
     * 내 주문/결제 내역
     * API 스펙: GET /orders/me
     */
    public Page<OrderSummaryResponse> getMyOrders(Long userId, String tab, Pageable pageable) {
        return orderRepository.findValidOrdersByUserId(userId, tab, pageable)
                .map(order -> {
                    List<Order> relatedOrders = orderRepository.findAllByTossOrderId(order.getTossOrderId());

                    int totalAmount = relatedOrders.stream().mapToInt(Order::getAmount).sum();
                    int totalQuantity = relatedOrders.stream().mapToInt(Order::getQuantity).sum();

                    String baseTitle = eventRepository.findById(order.getEventId())
                            .map(EventJpaEntity::getTitle)
                            .orElse("알 수 없는 이벤트");

                    String orderName = baseTitle;
                    if (relatedOrders.size() > 1) {
                        orderName += " 외 " + (relatedOrders.size() - 1) + "건";
                    }

                    return OrderSummaryResponse.builder()
                            .orderId(order.getId())
                            .tossOrderId(order.getTossOrderId())
                            .orderName(orderName)
                            .totalAmount(totalAmount)
                            .totalQuantity(totalQuantity)
                            .status(order.getStatus().name())
                            .orderedAt(order.getOrderedAt())
                            .paidAt(order.getPaidAt())
                            .build();
                });
    }

    /**
     * 참가 취소 (환불) — 티켓 재고 복구 + 세션 정원 복구
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

        // 3. 일괄 환불을 위해 공유 tossOrderId에 속한 모든 주문 조회
        List<Order> batchOrders = orderRepository.findAllByTossOrderId(order.getTossOrderId());

        // 4. 환불 가능 상태 검증
        for (Order o : batchOrders) {
            if (o.getStatus() == OrderStatus.REFUNDED || o.getStatus() == OrderStatus.CANCELLED) {
                throw new BusinessException(ErrorCode.ALREADY_REFUNDED);
            }
            if (o.getStatus() != OrderStatus.PAID) {
                throw new BusinessException(ErrorCode.REFUND_NOT_ALLOWED);
            }
        }

        // 5. 토스 결제 취소 API 호출
        if (order.getTossPaymentKey() != null && !"dummy_key".equals(order.getTossPaymentKey())) {
            tossPaymentClient.cancelPayment(order.getTossPaymentKey(), reason);
        }

        // 6. 모든 주문 상태 변경 + 티켓 재고/세션 정원 복구
        for (Order o : batchOrders) {
            o.refund();
            orderRepository.save(o);

            if (o.getTicketId() != null) {
                ticketRepositoryPort.findById(o.getTicketId()).ifPresent(ticket -> {
                    // 티켓 재고 복구
                    ticket.increaseStock(o.getQuantity());
                    ticketRepositoryPort.updateSoldCount(ticket.getId(), ticket.getSoldCount());

                    // 세션 정원 복구
                    List<Session> sessions = resolveTicketSessions(ticket);
                    for (Session session : sessions) {
                        session.decrementAttendees(o.getQuantity());
                        sessionPort.save(session, ticket.getEventId());
                    }
                });
            }

            // 환불 이력 저장
            refundSavePort.saveRefundRecord(o.getId(), userId, o.getAmount(), reason);
        }

        log.info("일괄 환불 완료: tossOrderId={}, count={}", order.getTossOrderId(), batchOrders.size());

        String eventTitle = eventRepository.findById(order.getEventId())
                .map(EventJpaEntity::getTitle)
                .orElse("알 수 없는 이벤트");

        return CancelOrderResponse.builder()
                .orderId(orderId)
                .eventTitle(eventTitle)
                .amount(batchOrders.stream().mapToInt(Order::getAmount).sum())
                .status(OrderStatus.REFUNDED.name())
                .reason(reason)
                .cancelledAt(LocalDateTime.now())
                .build();
    }

    // --- Private Helpers ---

    /**
     * 티켓에 연결된 세션 목록 조회
     * isAllSessions=true → 이벤트의 모든 세션
     * isAllSessions=false → ticket_sessions 매핑 테이블의 세션
     */
    private List<Session> resolveTicketSessions(Ticket ticket) {
        if (ticket.getIsAllSessions()) {
            return sessionPort.findByEventId(ticket.getEventId());
        } else {
            List<Long> sessionIds = ticket.getSessionIds();
            if (sessionIds == null || sessionIds.isEmpty()) {
                return List.of();
            }
            return sessionPort.findAllByIds(sessionIds);
        }
    }

    /**
     * 주문명 생성 헬퍼
     */
    private String buildOrderName(List<String> eventTitles) {
        if (eventTitles.isEmpty())
            return "VenueOn 강의";
        if (eventTitles.size() == 1)
            return eventTitles.get(0);
        return eventTitles.get(0) + " 외 " + (eventTitles.size() - 1) + "건";
    }

    private OrderDetailResponse toOrderDetailResponse(Order order) {
        EventJpaEntity event = eventRepository.findById(order.getEventId()).orElse(null);

        String eventTitle = event != null ? event.getTitle() : "알 수 없는 이벤트";
        String organizer = event != null ? "호스트 " + event.getCreator().getId() : "알 수 없는 호스트";
        String location = "-";

        // 티켓 정보 조회
        String ticketName = "-";
        int ticketPrice = 0;
        if (order.getTicketId() != null) {
            Ticket ticket = ticketRepositoryPort.findById(order.getTicketId()).orElse(null);
            if (ticket != null) {
                ticketName = ticket.getName();
                ticketPrice = ticket.getPrice();
            }
        }

        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .eventId(order.getEventId())
                .eventTitle(eventTitle)
                .ticketName(ticketName)
                .ticketPrice(ticketPrice)
                .status(order.getStatus().name())
                .quantity(order.getQuantity())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .orderedAt(order.getOrderedAt())
                .paidAt(order.getPaidAt())
                .organizer(organizer)
                .location(location)
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
