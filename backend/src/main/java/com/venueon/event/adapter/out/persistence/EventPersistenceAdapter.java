package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.application.port.in.GetEventListUseCase.EventSearchCondition;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.domain.model.Event;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;


/**
 * EventRepositoryPort 구현체 — JPA 연동
 */
@Component
@RequiredArgsConstructor
public class EventPersistenceAdapter implements EventRepositoryPort {

    private final EventJpaRepository eventJpaRepository;
    private final com.venueon.event.adapter.out.persistence.repository.EventTypeJpaRepository eventTypeJpaRepository;
    private final com.venueon.event.adapter.out.persistence.repository.EventStatusJpaRepository eventStatusJpaRepository;
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
        com.venueon.event.adapter.out.persistence.entity.EventTypeJpaEntity typeEntity = event.getType() != null ? eventTypeJpaRepository.findById(event.getType().id()).orElse(null) : null;
        com.venueon.event.adapter.out.persistence.entity.EventStatusJpaEntity statusEntity = event.getStatus() != null ? eventStatusJpaRepository.findById(event.getStatus().id()).orElse(null) : null;
        
        EventJpaEntity entity = eventMapper.toEntity(event, typeEntity, statusEntity);
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

            // PUBLISHED 상태만 공개 목록에 표시 (ID 기반)
            predicates.add(cb.equal(root.get("status").get("id"), com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID));

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
                try {
                    Long typeId = Long.parseLong(condition.type());
                    predicates.add(cb.equal(root.get("type").get("id"), typeId));
                } catch (NumberFormatException e) {
                    // 문자열 code로 들어온 경우 호환성 유지
                    predicates.add(cb.equal(root.get("type").get("code"), condition.type()));
                }
            }

            // isOnline 필터 — 세션 JOIN 기반
            if (condition.isOnline() != null) {
                Subquery<Integer> sq = query.subquery(Integer.class);
                Root<SessionJpaEntity> session = sq.from(SessionJpaEntity.class);
                sq.select(cb.literal(1));
                sq.where(
                        cb.equal(session.get("event").get("id"), root.get("id")),
                        cb.equal(session.get("isOnline"), condition.isOnline())
                );
                predicates.add(cb.exists(sq));
            }

            // 모집상태 필터 (recruitmentStatusId)
            if (condition.recruitmentStatusId() != null) {
                Subquery<Integer> sq = query.subquery(Integer.class);
                Root<SessionJpaEntity> session = sq.from(SessionJpaEntity.class);
                sq.select(cb.literal(1));

                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                Predicate statusPredicate = null;

                if (condition.recruitmentStatusId() == 1L) { // 모집예정 (PENDING)
                    statusPredicate = cb.and(
                            cb.isNotNull(session.get("recruitStartDate")),
                            cb.greaterThan(session.get("recruitStartDate"), now)
                    );
                } else if (condition.recruitmentStatusId() == 2L) { // 모집중 (OPEN)
                    statusPredicate = cb.and(
                            cb.or(cb.isNull(session.get("isRecruitmentClosed")), cb.isFalse(session.get("isRecruitmentClosed"))),
                            cb.or(
                                    cb.equal(session.get("maxAttendees"), 0),
                                    cb.lessThan(session.get("currentAttendees"), session.get("maxAttendees"))
                            ),
                            cb.or(cb.isNull(session.get("recruitStartDate")), cb.lessThanOrEqualTo(session.get("recruitStartDate"), now)),
                            cb.or(cb.isNull(session.get("recruitEndDate")), cb.greaterThanOrEqualTo(session.get("recruitEndDate"), now))
                    );
                } else if (condition.recruitmentStatusId() == 3L) { // 모집마감 (CLOSED)
                    statusPredicate = cb.or(
                            cb.isTrue(session.get("isRecruitmentClosed")),
                            cb.and(cb.greaterThan(session.get("maxAttendees"), 0), cb.greaterThanOrEqualTo(session.get("currentAttendees"), session.get("maxAttendees"))),
                            cb.and(cb.isNotNull(session.get("recruitEndDate")), cb.lessThan(session.get("recruitEndDate"), now))
                    );
                }

                if (statusPredicate != null) {
                    jakarta.persistence.criteria.Join<Object, Object> forcedRecruitJoin = session.join("forcedRecruitmentStatus", jakarta.persistence.criteria.JoinType.LEFT);
                    sq.where(
                            cb.equal(session.get("event").get("id"), root.get("id")),
                            cb.or(
                                    cb.equal(forcedRecruitJoin.get("id"), condition.recruitmentStatusId()),
                                    cb.and(cb.isNull(session.get("forcedRecruitmentStatus")), statusPredicate)
                            )
                    );
                    predicates.add(cb.exists(sq));
                }
            }

            // 메인 페이지 이벤트 상태 필터 (eventStatusId)
            if (condition.eventStatusId() != null) {
                Subquery<Integer> sq = query.subquery(Integer.class);
                Root<SessionJpaEntity> session = sq.from(SessionJpaEntity.class);
                sq.select(cb.literal(1));

                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                Predicate statusPredicate = null;

                if (condition.eventStatusId() == 2L) { // 진행예정 / 발행됨 (PUBLISHED)
                    statusPredicate = cb.or(
                            cb.isNull(session.get("startTime")),
                            cb.greaterThan(session.get("startTime"), now)
                    );
                } else if (condition.eventStatusId() == 3L) { // 진행중 (ONGOING)
                    statusPredicate = cb.and(
                            cb.isNotNull(session.get("startTime")),
                            cb.isNotNull(session.get("endTime")),
                            cb.lessThanOrEqualTo(session.get("startTime"), now),
                            cb.greaterThanOrEqualTo(session.get("endTime"), now)
                    );
                } else if (condition.eventStatusId() == 4L) { // 종료됨 (ENDED)
                    statusPredicate = cb.and(
                            cb.isNotNull(session.get("endTime")),
                            cb.lessThan(session.get("endTime"), now)
                    );
                }

                if (statusPredicate != null) {
                    jakarta.persistence.criteria.Join<Object, Object> forcedSessionJoin = session.join("forcedSessionStatus", jakarta.persistence.criteria.JoinType.LEFT);
                    sq.where(
                            cb.equal(session.get("event").get("id"), root.get("id")),
                            cb.or(
                                    cb.equal(forcedSessionJoin.get("id"), condition.eventStatusId()),
                                    cb.and(cb.isNull(session.get("forcedSessionStatus")), statusPredicate)
                            )
                    );
                    predicates.add(cb.exists(sq));
                }
            }

            // TODO: 지역(regionSido/regionSigungu) 필터 — 세션 JOIN 기반으로 추가 예정

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
