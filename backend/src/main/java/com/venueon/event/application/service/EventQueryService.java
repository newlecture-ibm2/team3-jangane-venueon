package com.venueon.event.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.event.application.port.in.GetEventDetailUseCase;
import com.venueon.event.application.port.in.GetEventListUseCase;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.application.port.out.LoadHostInfoPort;
import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import com.venueon.event.domain.model.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 이벤트 조회 서비스 (UseCase 구현체)
 */
@UseCase
@RequiredArgsConstructor
public class EventQueryService implements GetEventListUseCase, GetEventDetailUseCase {

    private final EventRepositoryPort eventRepositoryPort;
    private final LoadHostInfoPort loadHostInfoPort;

    @Override
    public Page<Event> getEventList(EventSearchCondition condition, Pageable pageable) {
        return eventRepositoryPort.findAll(condition, pageable);
    }

    @Override
    public Event getEventById(Long eventId) {
        return eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + eventId));
    }

    /**
     * 이벤트 상세 + Host 정보 함께 조회
     */
    public HostInfo getHostInfoByCreatorId(Long creatorId) {
        return loadHostInfoPort.findByUserId(creatorId).orElse(null);
    }
}
