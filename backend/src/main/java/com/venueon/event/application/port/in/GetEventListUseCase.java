package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 이벤트 목록 조회 유스케이스 (Port-In)
 */
public interface GetEventListUseCase {

    Page<Event> getEventList(EventSearchCondition condition, Pageable pageable);

    /**
     * 이벤트 검색/필터 조건
     */
    record EventSearchCondition(
            String keyword,
            Long categoryId,
            EventType type,
            Boolean isOnline,
            Boolean isFree,
            Integer minPrice,
            Integer maxPrice,
            String sort
    ) {
        public static EventSearchCondition empty() {
            return new EventSearchCondition(null, null, null, null, null, null, null, null);
        }
    }
}
