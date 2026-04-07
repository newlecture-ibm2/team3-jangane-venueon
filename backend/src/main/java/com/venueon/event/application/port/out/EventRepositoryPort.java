package com.venueon.event.application.port.out;

import com.venueon.event.application.port.in.GetEventListUseCase.EventSearchCondition;
import com.venueon.event.domain.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 이벤트 저장/조회 인터페이스 (Port-Out)
 * Service는 이 포트만 의존 — JPA 직접 참조 금지
 */
public interface EventRepositoryPort {

    Page<Event> findAll(EventSearchCondition condition, Pageable pageable);

    Optional<Event> findById(Long id);

    Event save(Event event);

    void deleteById(Long id);
}
