package com.venueon.event.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.event.application.port.in.CreateEventUseCase;
import com.venueon.event.application.port.in.UpdateEventStatusUseCase;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 이벤트 생성/수정 서비스 (Command 전용)
 */
@UseCase
@RequiredArgsConstructor
@Transactional
public class EventCommandService implements CreateEventUseCase, UpdateEventStatusUseCase {

    private final EventRepositoryPort eventRepositoryPort;

    @Override
    public Event createEvent(CreateEventCommand command) {
        Event event = new Event(
                null,                       // id (auto-generated)
                command.creatorId(),
                command.categoryId(),
                command.title(),
                command.description(),
                command.type(),
                EventStatus.DRAFT,          // 최초 생성 시 항상 DRAFT
                command.location(),
                command.isOnline(),
                command.price(),
                command.maxAttendees(),
                command.thumbnailUrl(),
                command.startDate(),
                command.endDate(),
                LocalDateTime.now(),        // createdAt
                LocalDateTime.now()         // updatedAt
        );

        return eventRepositoryPort.save(event);
    }

    @Override
    public Event updateStatus(Long eventId, Long requesterId, EventStatus newStatus) {
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + eventId));

        // 본인 소유 이벤트만 상태 변경 가능
        if (!event.isOwnedBy(requesterId)) {
            throw new IllegalStateException("이벤트 상태 변경 권한이 없습니다.");
        }

        // 도메인 비즈니스 로직 위임
        switch (newStatus) {
            case PUBLISHED -> event.publish();
            case ENDED -> event.end();
            case CANCELLED -> event.cancel();
            default -> throw new IllegalArgumentException("지원하지 않는 상태 변경입니다: " + newStatus);
        }

        return eventRepositoryPort.save(event);
    }
}
