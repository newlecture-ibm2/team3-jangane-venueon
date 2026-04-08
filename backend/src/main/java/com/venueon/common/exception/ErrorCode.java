package com.venueon.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    // Order / Payment
    EVENT_NOT_FOUND(HttpStatus.NOT_FOUND, "이벤트를 찾을 수 없습니다."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "주문을 찾을 수 없습니다."),
    ORDER_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 수강 중인 이벤트입니다."),
    EVENT_FULL(HttpStatus.UNPROCESSABLE_ENTITY, "정원이 초과되었습니다."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "결제 금액이 일치하지 않습니다."),
    PAYMENT_FAILED(HttpStatus.PAYMENT_REQUIRED, "토스 결제 승인에 실패했습니다."),
    ORDER_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인의 주문만 조회 가능합니다."),
    ALREADY_REFUNDED(HttpStatus.UNPROCESSABLE_ENTITY, "이미 환불 처리된 주문입니다."),
    REFUND_NOT_ALLOWED(HttpStatus.UNPROCESSABLE_ENTITY, "환불이 불가능한 주문 상태입니다."),
    REFUND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "환불 처리 중 오류가 발생했습니다."),
    
    // Session
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "세션을 찾을 수 없습니다."),
    SESSION_DELETE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "기본 세션이거나 등록된 주문이 있어 삭제할 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}
