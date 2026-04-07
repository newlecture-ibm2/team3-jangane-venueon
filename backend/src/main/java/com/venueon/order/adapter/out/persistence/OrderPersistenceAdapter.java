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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepositoryPort {

    private final OrderJpaRepository orderJpaRepository;
    private final EventJpaRepository eventJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity;

        if (order.getId() == null) {
            // 새로 생성
            UserJpaEntity user = userJpaRepository.findById(order.getUserId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
            EventJpaEntity event = eventJpaRepository.findById(order.getEventId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

            entity = OrderJpaEntity.builder()
                    .user(user)
                    .event(event)
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
            
            // 단순 필드들 업데이트 가능성 (Toss 주문정보 등)
            entity.updateTossOrderId(order.getTossOrderId());
            if (order.getStatus() == OrderStatus.PAID) {
                // JPA Entity 내부의 confirmPayment 메서드를 쓰려면 키만 전달하거나 직접 상태 세팅
                entity.confirmPayment(order.getTossPaymentKey());
            } else if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
                // 기타 상태 변경일 경우 추가 로직 고려. 현재는 리플렉션이나 setter 우회 등 필요 (여기선 간략히 생략)
                // 현재 Entity에 cancel() 메서드 부족하므로 추가 고려해야 함 (하지만 이번 스코프는 저장 연동 위주)
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
    public Page<Order> findByUserId(Long userId, Pageable pageable) {
        return orderJpaRepository.findByUserId(userId, pageable).map(this::toDomain);
    }

    // --- Mapper ---
    private Order toDomain(OrderJpaEntity entity) {
        return new Order(
                entity.getId(),
                entity.getUser().getId(),
                entity.getEvent().getId(),
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
