package com.venueon.report.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.report.adapter.out.persistence.entity.RefundJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.RefundJpaRepository;
import com.venueon.report.application.port.in.RequestRefundUseCase;
import com.venueon.report.domain.model.RefundStatus;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@UseCase
@RequiredArgsConstructor
@Transactional
public class RefundCommandService implements RequestRefundUseCase {

    private final RefundJpaRepository refundRepository;
    private final OrderJpaRepository orderRepository;
    private final UserJpaRepository userRepository;

    @Override
    public void requestRefund(Long orderId, Long userId, int amount, String reason) {
        OrderJpaEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        RefundJpaEntity refund = RefundJpaEntity.builder()
                .order(order)
                .user(user)
                .amount(amount)
                .reason(reason)
                .status(RefundStatus.PENDING)
                .build();

        refundRepository.save(refund);
        log.info("환불 신청 완료: order={}, amount={}", orderId, amount);
    }
}
