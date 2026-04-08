package com.venueon.cart.adapter.out.event;

import com.venueon.cart.application.port.out.LoadEventInfoPort;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.domain.model.EventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * LoadEventInfoPort 구현체
 * Event 모듈에서 이벤트 정보 조회
 */
@Component
@RequiredArgsConstructor
public class EventInfoAdapter implements LoadEventInfoPort {

    private final EventJpaRepository eventJpaRepository;

    @Override
    public Optional<EventInfo> findById(Long eventId) {
        return eventJpaRepository.findById(eventId)
                .map(this::mapToEventInfo);
    }

    private EventInfo mapToEventInfo(EventJpaEntity event) {
        // PUBLISHED 상태에서만 등록 가능
        boolean isRegistrationOpen = event.getStatus() == EventStatus.PUBLISHED;

        return new EventInfo(
                event.getId(),
                event.getTitle(),
                event.getPrice(),
                event.getPrice(), // discountedPrice -> price (할인 없음)
                0, // discountRate -> 0 (할인 없음)
                event.getMaxAttendees(),
                0, // currentAttendees - 별도 조회 필요
                event.getStartDate(),
                isRegistrationOpen
        );
    }
}
