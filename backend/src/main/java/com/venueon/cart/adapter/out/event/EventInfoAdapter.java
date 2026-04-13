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
 * v6: price, maxAttendees, startDate 제거 — Session/Ticket 기반으로 이동
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
                0, // price → Ticket 기반 (Phase 3)
                0, // discountedPrice → Ticket 기반
                0, // discountRate → 0
                0, // maxAttendees → Session 기반
                0, // currentAttendees → Session 기반
                null, // startDate → Session 기반
                isRegistrationOpen
        );
    }
}
