package com.venueon.event.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.domain.model.Session;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * SessionJpaEntity ↔ Session 도메인 모델 변환
 * v6: EventSessionMapper → SessionMapper 리네이밍, price 제거, 모집 필드 추가
 */
import com.venueon.event.adapter.out.persistence.repository.EventStatusJpaRepository;
import com.venueon.ticket.adapter.out.persistence.repository.RecruitmentStatusJpaRepository;

@Component
@RequiredArgsConstructor
public class SessionMapper {

    private final EntityManager entityManager;
    private final EventStatusJpaRepository eventStatusJpaRepository;
    private final RecruitmentStatusJpaRepository recruitmentStatusJpaRepository;

    /**
     * JPA Entity → 도메인 모델
     */
    public Session toDomain(SessionJpaEntity entity) {
        return new Session(
                entity.getId(),
                entity.getEvent() != null ? entity.getEvent().getId() : null,
                entity.getTitle(),
                entity.getDescription(),
                entity.getSortOrder(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getLocation(),
                entity.getRegionSido(),
                entity.getRegionSigungu(),
                entity.getAddressRoad(),
                entity.getAddressDetail(),
                entity.isOnline(),
                entity.getOnlineLink(),
                entity.getMaxAttendees(),
                entity.getCurrentAttendees(),
                entity.getRecruitStartDate(),
                entity.getRecruitEndDate(),
                entity.isRecruitmentClosed(),
                entity.getForcedRecruitmentStatus() != null ? com.venueon.common.model.DomainCode.of(entity.getForcedRecruitmentStatus().getId(), entity.getForcedRecruitmentStatus().getLabel()) : null,
                entity.getForcedSessionStatus() != null ? com.venueon.common.model.DomainCode.of(entity.getForcedSessionStatus().getId(), entity.getForcedSessionStatus().getLabel()) : null,
                entity.isDefault(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    /**
     * 도메인 모델 → JPA Entity
     */
    public SessionJpaEntity toJpaEntity(Session domain, EventJpaEntity eventEntity, com.venueon.ticket.adapter.out.persistence.entity.RecruitmentStatusJpaEntity recruitEntity, com.venueon.event.adapter.out.persistence.entity.EventStatusJpaEntity statusEntity) {
        return SessionJpaEntity.builder()
                .id(domain.getId())
                .event(eventEntity)
                .title(domain.getTitle())
                .description(domain.getDescription())
                .sortOrder(domain.getSortOrder())
                .startTime(domain.getStartTime())
                .endTime(domain.getEndTime())
                .location(domain.getLocation())
                .regionSido(domain.getRegionSido())
                .regionSigungu(domain.getRegionSigungu())
                .addressRoad(domain.getAddressRoad())
                .addressDetail(domain.getAddressDetail())
                .isOnline(domain.getIsOnline())
                .onlineLink(domain.getOnlineLink())
                .maxAttendees(domain.getMaxAttendees())
                .currentAttendees(domain.getCurrentAttendees())
                .recruitStartDate(domain.getRecruitStartDate())
                .recruitEndDate(domain.getRecruitEndDate())
                .isRecruitmentClosed(domain.getIsRecruitmentClosed())
                .forcedRecruitmentStatus(recruitEntity)
                .forcedSessionStatus(statusEntity)
                .isDefault(domain.getIsDefault())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    /**
     * 도메인 모델 → JPA Entity (eventId로 참조)
     */
    public SessionJpaEntity toJpaEntity(Session domain, Long eventId) {
        EventJpaEntity eventRef = entityManager.getReference(EventJpaEntity.class, eventId);
        com.venueon.ticket.adapter.out.persistence.entity.RecruitmentStatusJpaEntity recruitEntity = null;
        if (domain.getForcedRecruitmentStatus() != null) {
            recruitEntity = recruitmentStatusJpaRepository.findById(domain.getForcedRecruitmentStatus().id()).orElse(null);
        }
        com.venueon.event.adapter.out.persistence.entity.EventStatusJpaEntity statusEntity = null;
        if (domain.getForcedSessionStatus() != null) {
            statusEntity = eventStatusJpaRepository.findById(domain.getForcedSessionStatus().id()).orElse(null);
        }
        return toJpaEntity(domain, eventRef, recruitEntity, statusEntity);
    }
}
