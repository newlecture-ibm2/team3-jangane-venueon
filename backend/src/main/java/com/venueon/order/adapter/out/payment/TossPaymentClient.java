package com.venueon.order.adapter.out.payment;

import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.Map;

/**
 * 토스페이먼츠 결제 승인 API 클라이언트
 * POST https://api.tosspayments.com/v1/payments/confirm
 */
@Slf4j
@Component
public class TossPaymentClient {

    private final RestClient restClient;
    private final String secretKey;

    public TossPaymentClient(@Value("${toss.secret-key}") String secretKey) {
        this.secretKey = secretKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.tosspayments.com")
                .build();
    }

    /**
     * 토스 결제 승인 요청
     * @param paymentKey 토스가 발급한 결제 키
     * @param orderId    우리 시스템의 tossOrderId
     * @param amount     결제 금액
     * @return 토스 응답 Map
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> confirmPayment(String paymentKey, String orderId, int amount) {
        String encodedKey = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes());

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/v1/payments/confirm")
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "paymentKey", paymentKey,
                            "orderId", orderId,
                            "amount", amount
                    ))
                    .retrieve()
                    .body(Map.class);

            log.info("토스 결제 승인 성공: orderId={}, paymentKey={}", orderId, paymentKey);
            return response;

        } catch (Exception e) {
            log.error("토스 결제 승인 실패: orderId={}, error={}", orderId, e.getMessage());
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "토스 결제 승인 실패: " + e.getMessage());
        }
    }
}
