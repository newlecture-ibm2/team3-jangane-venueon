package com.venueon.event.domain.model;

/**
 * 이벤트 상태 (DB 저장 대상: DRAFT, PUBLISHED, ENDED, CANCELLED)
 *
 * ONGOING은 DB에 저장하지 않음 — 세션의 startTime/endTime 기반으로 조회 시 Computed.
 */
public enum EventStatus {
    DRAFT, PUBLISHED, ONGOING, ENDED, CANCELLED
    // ONGOING은 DB에 저장하지 않음 — 세션 기반 Computed
}
