package com.venueon.order.adapter.out.persistence;

import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.application.port.out.RefundSavePort;
import com.venueon.report.adapter.out.persistence.entity.RefundJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.RefundJpaRepository;
import com.venueon.report.domain.model.RefundStatus;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * RefundSavePort 구현체 (Adapter)
 * - 헥사고날 아키텍처에 따라 인프라 계층에서 JPA 엔티티를 직접 다룸
 * - OrderService는 이 클래스를 직접 알지 못하고 RefundSavePort만 의존
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RefundPersistenceAdapter implements RefundSavePort {

    private final RefundJpaRepository refundJpaRepository;
    private final OrderJpaRepository orderJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public Long saveRefundRecord(Long orderId, Long userId, int amount, String reason) {
        OrderJpaEntity order = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        UserJpaEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        RefundJpaEntity refund = RefundJpaEntity.builder()
                .order(order)
                .user(user)
                .amount(amount)
                .status(RefundStatus.APPROVED)
                .reason(reason)
                .processedAt(LocalDateTime.now())
                .build();

        RefundJpaEntity saved = refundJpaRepository.save(refund);
        log.info("환불 이력 저장 완료: refundId={}, orderId={}, amount={}", saved.getId(), orderId, amount);

        return saved.getId();
    }
}
