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

    /**
     * 검색/필터 조건을 JPA Specification으로 변환
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

            // 온라인 여부 필터
            if (condition.isOnline() != null) {
                predicates.add(cb.equal(root.get("isOnline"), condition.isOnline()));
            }

            // 무료 여부 필터
            if (condition.isFree() != null) {
                if (condition.isFree()) {
                    predicates.add(cb.equal(root.get("price"), 0));
                } else {
                    predicates.add(cb.greaterThan(root.get("price"), 0));
                }
            }

            // 가격 범위 필터
            if (condition.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), condition.minPrice()));
            }
            if (condition.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), condition.maxPrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
