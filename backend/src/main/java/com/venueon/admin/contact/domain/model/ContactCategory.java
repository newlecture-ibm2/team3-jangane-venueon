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
    /** 기타 */
    OTHER
}
