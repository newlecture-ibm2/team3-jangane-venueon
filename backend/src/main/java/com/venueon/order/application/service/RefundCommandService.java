package com.venueon.order.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.order.application.port.in.RequestRefundUseCase;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.application.port.out.RefundSavePort;
import com.venueon.order.domain.model.Order;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

/**
 * 환불 신청 서비스 — Port 인터페이스만 의존 (JPA 직접 참조 제거)
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
@Transactional
public class RefundCommandService implements RequestRefundUseCase {

    private final OrderRepositoryPort orderRepository;
    private final UserRepositoryPort userRepository;
    private final RefundSavePort refundSavePort;

    @Override
    public void requestRefund(Long orderId, Long userId, int amount, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        refundSavePort.saveRefundRecord(orderId, userId, amount, reason);
        log.info("환불 신청 완료: order={}, amount={}", orderId, amount);
    }
}
