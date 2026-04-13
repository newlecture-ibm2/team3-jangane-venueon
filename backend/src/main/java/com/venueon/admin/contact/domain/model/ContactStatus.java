package com.venueon.admin.contact.domain.model;

/**
 * 어드민 요청 처리 상태
 */
public enum ContactStatus {
    /** 대기중 */
    PENDING,
    /** 검토중 */
    REVIEWING,
    /** 처리완료 */
    COMPLETED,
    /** 반려 */
    REJECTED,
    /** 사용자 취소 */
    CANCELLED
}
