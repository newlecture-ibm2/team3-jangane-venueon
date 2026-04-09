package com.venueon.order.adapter.out.persistence;

import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.domain.model.Order;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventSessionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepositoryPort {

    private final OrderJpaRepository orderJpaRepository;
    private final EventJpaRepository eventJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final EventSessionJpaRepository eventSessionJpaRepository;

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity;

        if (order.getId() == null) {
            // 새로 생성
            UserJpaEntity user = userJpaRepository.findById(order.getUserId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
            EventJpaEntity event = eventJpaRepository.findById(order.getEventId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

            EventSessionJpaEntity session = null;
            if (order.getSessionId() != null) {
                session = eventSessionJpaRepository.findById(order.getSessionId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND)); // Or Session NotFound
            }

            entity = OrderJpaEntity.builder()
                    .user(user)
                    .event(event)
                    .session(session)
                    .status(order.getStatus())
                    .quantity(order.getQuantity())
                    .amount(order.getAmount())
                    .paymentMethod(order.getPaymentMethod())
                    .tossPaymentKey(order.getTossPaymentKey())
                    .tossOrderId(order.getTossOrderId())
                    .build();
        } else {
            // 업데이트
            entity = orderJpaRepository.findById(order.getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
            
            // 도메인 모델의 상태 변화를 엔티티에 동기화
            entity.updateStatus(order.getStatus());
            entity.updateTossOrderId(order.getTossOrderId());

            if (order.getStatus() == OrderStatus.PAID && order.getTossPaymentKey() != null) {
                entity.confirmPayment(order.getTossPaymentKey());
            }
        }

        OrderJpaEntity savedEntity = orderJpaRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Order> findById(Long id) {
        return orderJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Order> findByTossOrderId(String tossOrderId) {
        return orderJpaRepository.findByTossOrderId(tossOrderId).map(this::toDomain);
    }

    @Override
    public List<Order> findByUserIdAndEventIdAndStatusIn(Long userId, Long eventId, List<OrderStatus> statuses) {
        return orderJpaRepository.findByUserIdAndEventIdAndStatusIn(userId, eventId, statuses)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public long countByEventIdAndStatusIn(Long eventId, List<OrderStatus> statuses) {
        return orderJpaRepository.countByEventIdAndStatusIn(eventId, statuses);
    }

    @Override
    public long countBySessionIdAndStatusIn(Long sessionId, List<OrderStatus> statuses) {
        return orderJpaRepository.countBySessionIdAndStatusIn(sessionId, statuses);
    }

    @Override
    public List<Order> findByUserIdAndSessionIdAndStatusIn(Long userId, Long sessionId, List<OrderStatus> statuses) {
        return orderJpaRepository.findByUserIdAndSessionIdAndStatusIn(userId, sessionId, statuses)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Order> findByUserId(Long userId, Pageable pageable) {
        return orderJpaRepository.findByUserId(userId, pageable).map(this::toDomain);
    }

    @Override
    public Page<Order> findValidOrdersByUserId(Long userId, String tab, Pageable pageable) {
        List<com.venueon.event.domain.model.EventStatus> statuses = new ArrayList<>();
        boolean hasStatuses = false;

        if (tab != null && !tab.isEmpty()) {
            hasStatuses = true;
            if ("upcoming".equals(tab)) {
                statuses.addAll(List.of(com.venueon.event.domain.model.EventStatus.DRAFT, com.venueon.event.domain.model.EventStatus.PUBLISHED, com.venueon.event.domain.model.EventStatus.PREPARING));
            } else if ("enrolled".equals(tab)) {
                statuses.add(com.venueon.event.domain.model.EventStatus.ONGOING);
            } else if ("completed".equals(tab)) {
                statuses.add(com.venueon.event.domain.model.EventStatus.ENDED);
            } else {
                hasStatuses = false;
            }
        }
        
        if (statuses.isEmpty()) {
            statuses.add(com.venueon.event.domain.model.EventStatus.DRAFT); 
        }

        return orderJpaRepository.findValidOrdersByUserIdAndEventStatuses(userId, hasStatuses, statuses, pageable).map(this::toDomain);
    }

    @Override
    public long countOngoingByUserId(Long userId) {
        return orderJpaRepository.countOngoingByUserId(userId);
    }

    @Override
    public long countCompletedByUserId(Long userId) {
        return orderJpaRepository.countCompletedByUserId(userId);
    }

    // --- Mapper ---
    private Order toDomain(OrderJpaEntity entity) {
        return new Order(
                entity.getId(),
                entity.getUser().getId(),
                entity.getEvent().getId(),
                entity.getSession() != null ? entity.getSession().getId() : null,
                entity.getStatus(),
                entity.getQuantity(),
                entity.getAmount(),
                entity.getPaymentMethod(),
                entity.getTossPaymentKey(),
                entity.getTossOrderId(),
                entity.getOrderedAt(),
                entity.getPaidAt()
        );
    }
}
