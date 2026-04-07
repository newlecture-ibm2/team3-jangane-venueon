package com.venueon.order.application.port.out;

/**
 * 환불 이력 저장 포트 (Output Port)
 * - OrderService는 이 인터페이스에만 의존
 * - 실제 구현(Adapter)은 report 모듈의 RefundJpaRepository를 사용
 */
public interface RefundSavePort {

    /**
     * 환불 이력 저장
     * @param orderId 주문 ID
     * @param userId 환불 요청 사용자 ID
     * @param amount 환불 금액
     * @param reason 환불 사유
     * @return 생성된 환불 이력 ID
     */
    Long saveRefundRecord(Long orderId, Long userId, int amount, String reason);
}
