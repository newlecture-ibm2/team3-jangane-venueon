package com.venueon.admin.contact.domain.model;

/**
 * 어드민 요청 카테고리
 */
public enum ContactCategory {
    /** 사업자등록증 확인 요청 (호스트) */
    BUSINESS_LICENSE,
    /** 호스트 문의 */
    HOST_INQUIRY,
    /** 참석자 문의 */
    USER_INQUIRY,
    /** 결제/환불 문의 (사용자) */
    PAYMENT,
    /** 계정 문제 (사용자) */
    ACCOUNT,
    /** 시스템 오류 (공통) */
    SYSTEM_ERROR,
    /** 이의 제기 (사용자) */
    OBJECTION,
    /** 정산 문의 (호스트) */
    BILLING,
    /** 이벤트 관리 (호스트) */
    EVENT_MANAGEMENT,
    /** 기타 */
    OTHER
}
