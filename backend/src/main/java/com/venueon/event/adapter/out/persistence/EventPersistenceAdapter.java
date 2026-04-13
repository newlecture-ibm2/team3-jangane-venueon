package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.application.port.in.GetEventListUseCase.EventSearchCondition;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * EventRepositoryPort 구현체 — JPA 연동
 */
@Component
@RequiredArgsConstructor
public class EventPersistenceAdapter implements EventRepositoryPort {

    private final EventJpaRepository eventJpaRepository;
    private final EventMapper eventMapper;

    @Override
    public Page<Event> findAll(EventSearchCondition condition, Pageable pageable) {
        Specification<EventJpaEntity> spec = buildSpecification(condition);
        return eventJpaRepository.findAll(spec, pageable)
                .map(eventMapper::toDomain);
    }

    @Override
    public Optional<Event> findById(Long id) {
        return eventJpaRepository.findById(id)
                .filter(e -> !e.isHidden())
                .map(eventMapper::toDomain);
    }

    @Override
    public Event save(Event event) {
        EventJpaEntity entity = eventMapper.toEntity(event);
        EventJpaEntity saved = eventJpaRepository.save(entity);
        return eventMapper.toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        eventJpaRepository.deleteById(id);
    }

    /**
     * 검색/필터 조건을 JPA Specification으로 변환
     * v6: price, isOnline 컬럼이 이벤트에서 제거됨 → 세션/티켓 기반으로 재구현 필요
     */
    private Specification<EventJpaEntity> buildSpecification(EventSearchCondition condition) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 숨김 처리된 이벤트 제외
            predicates.add(cb.isFalse(root.get("isHidden")));

            // PUBLISHED 상태만 공개 목록에 표시
            predicates.add(cb.equal(root.get("status"), EventStatus.PUBLISHED));

            // 키워드 검색 (제목)
            if (condition.keyword() != null && !condition.keyword().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + condition.keyword().toLowerCase() + "%"
                ));
            }

            // 카테고리 필터
            if (condition.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), condition.categoryId()));
            }

            // 이벤트 타입 필터
            if (condition.type() != null) {
                predicates.add(cb.equal(root.get("type"), condition.type()));
            }

            // TODO: isOnline 필터 — 세션 JOIN 기반으로 재구현 예정 (EventJpaEntity에 sessions 관계 매핑 추가 후)
            // TODO: 지역(regionSido/regionSigungu) 필터 — 세션 JOIN 기반으로 추가 예정

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
