package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 이벤트 목록 조회 유스케이스 (Port-In)
 */
public interface GetEventListUseCase {

    Page<Event> getEventList(EventSearchCondition condition, Pageable pageable);

    /**
     * 이벤트 검색/필터 조건
     * v6: isFree, minPrice, maxPrice 제거 (가격은 Ticket 도메인)
     *     isOnline은 유지하되 세션 기반으로 필터링
     */
    record EventSearchCondition(
            String keyword,
            Long categoryId,
            String type,
            Boolean isOnline,       // 세션 기반 필터 (향후 JOIN)
            Long recruitmentStatusId, // 모집 상태 필터
            Long eventStatusId,       // 이벤트 진행 상태 필터
            String sort
    ) {
        public static EventSearchCondition empty() {
            return new EventSearchCondition(null, null, null, null, null, null, null);
        }
    }
}
