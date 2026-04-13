package com.venueon.event.domain.model;

/**
 * 모집 상태 (Computed — DB 미저장)
 *
 * 세션 단위에서 조회 시 계산 → 이벤트 레벨로 OR 종합.
 * 우선순위: 수동 마감 > 정원 초과 > 날짜 기반 > 기본(OPEN)
 */
public enum RecruitmentStatus {
    PENDING,  // 모집 대기 (recruitStartDate 이전)
    OPEN,     // 모집중
    CLOSED    // 마감 (기한 초과 / 정원 초과 / 호스트 수동 마감)
}
