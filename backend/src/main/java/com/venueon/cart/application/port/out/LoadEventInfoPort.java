package com.venueon.cart.application.port.out;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 이벤트 정보 조회 Port-Out
 * Cart 모듈이 Event 모듈에 직접 의존하지 않도록 인터페이스로 분리
 */
public interface LoadEventInfoPort {

    /**
     * 이벤트 정보 조회
     */
    Optional<EventInfo> findById(Long eventId);

    /**
     * 이벤트 정보 Value Object
     */
    record EventInfo(
            Long id,
            String title,
            int price,
            int discountedPrice,
            int discountRate,
            int maxAttendees,
            int currentAttendees,
            LocalDateTime startDate,
            boolean isRegistrationOpen
    ) {
        /**
         * 정원 초과 여부 확인
         */
        public boolean isFull() {
            return currentAttendees >= maxAttendees;
        }

        /**
         * 할인 적용 가격 계산
         */
        public int getFinalPrice() {
            return discountedPrice > 0 ? discountedPrice : price;
        }
    }
}
