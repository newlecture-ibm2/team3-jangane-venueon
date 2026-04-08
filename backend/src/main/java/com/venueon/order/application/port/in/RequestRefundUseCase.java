package com.venueon.order.application.port.in;

public interface RequestRefundUseCase {
    void requestRefund(Long orderId, Long userId, int amount, String reason);
}
