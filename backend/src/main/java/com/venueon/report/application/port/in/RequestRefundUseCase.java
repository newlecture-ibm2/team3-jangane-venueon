package com.venueon.report.application.port.in;

public interface RequestRefundUseCase {
    void requestRefund(Long orderId, Long userId, int amount, String reason);
}
