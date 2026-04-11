package com.venueon.admin.request.domain.model;

/**
 * 어드민 요청 처리 상태
 */
public enum RequestStatus {
    /** 대기중 */
    PENDING,
    /** 검토중 */
    REVIEWING,
    /** 처리완료 */
    COMPLETED,
    /** 반려 */
    REJECTED
}
