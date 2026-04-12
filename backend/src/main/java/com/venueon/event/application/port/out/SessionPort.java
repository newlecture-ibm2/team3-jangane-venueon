package com.venueon.event.application.port.out;

import com.venueon.event.domain.model.Session;

import java.util.List;
import java.util.Optional;

/**
 * 세션 저장/조회 인터페이스 (Port-Out)
 * Service는 이 포트만 의존 — JPA 직접 참조 금지
 * v6: EventSession → Session 리네이밍
 */
public interface SessionPort {

    Session save(Session session, Long eventId);

    Optional<Session> findById(Long id);

    List<Session> findByEventId(Long eventId);

    void deleteById(Long id);

    Optional<Session> findDefaultByEventId(Long eventId);

    int countByEventId(Long eventId);

    /**
     * 여러 세션 ID로 일괄 조회
     * 개별 세션 티켓의 연결된 세션 목록을 가져올 때 사용
     */
    List<Session> findAllByIds(List<Long> ids);

    /**
     * 비관적 잠금 조회 — 동시성 제어 (정원 초과 판매 방지)
     * OrderService에서 정원 차감 시 사용
     */
    Optional<Session> findByIdForUpdate(Long id);

    /**
     * 여러 이벤트 ID로 세션 벌크 조회
     * 이벤트 목록 API에서 N+1 방지용
     */
    List<Session> findByEventIds(List<Long> eventIds);
}
