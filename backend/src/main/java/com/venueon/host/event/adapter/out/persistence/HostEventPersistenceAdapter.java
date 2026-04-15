package com.venueon.host.event.adapter.out.persistence;

import com.venueon.host.event.adapter.in.web.dto.HostEventResponse;
import com.venueon.host.event.adapter.out.persistence.repository.HostEventJpaRepository;
import com.venueon.host.event.application.port.out.HostEventQueryPort;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

/**
 * HostEventQueryPort 구현체 — JPA 접근은 이 Adapter에서만 수행.
 */
@Component
@RequiredArgsConstructor
public class HostEventPersistenceAdapter implements HostEventQueryPort {

    private final HostEventJpaRepository hostEventJpaRepository;
    private final HostEventMapper hostEventMapper;
    private final com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository sessionJpaRepository;
    private final com.venueon.ticket.adapter.out.persistence.repository.TicketJpaRepository ticketJpaRepository;
    private final com.venueon.host.order.adapter.out.persistence.repository.HostOrderQueryRepository orderQueryRepository;
    private final com.venueon.event.adapter.out.persistence.EventMapper eventMapper;
    private final com.venueon.event.adapter.out.persistence.SessionMapper sessionMapper;
    private final com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository hostProfileJpaRepository;

    @Override
    public Page<HostEventResponse> findByHostId(Long hostId, String status, Pageable pageable) {
        Page<EventJpaEntity> page;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            page = hostEventJpaRepository.findByCreatorId(hostId, pageable);
        } else {
            page = hostEventJpaRepository.findByCreatorIdAndStatus(hostId, status.toUpperCase(), pageable);
        }
        return enrichAndMap(page);
    }

    @Override
    public Page<HostEventResponse> findDraftsByHostId(Long hostId, Pageable pageable) {
        Page<EventJpaEntity> page = hostEventJpaRepository.findByCreatorIdAndStatus(hostId, "DRAFT", pageable);
        return enrichAndMap(page);
    }

    private Page<HostEventResponse> enrichAndMap(Page<EventJpaEntity> page) {
        java.util.List<Long> eventIds = page.getContent().stream().map(EventJpaEntity::getId).toList();

        java.util.Map<Long, java.util.List<com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity>> sessionsMap =
                sessionJpaRepository.findByEventIdIn(eventIds).stream()
                        .collect(java.util.stream.Collectors.groupingBy(s -> s.getEvent().getId()));

        java.util.Map<Long, java.util.List<com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity>> ticketsMap =
                ticketJpaRepository.findByEventIdIn(eventIds).stream()
                        .collect(java.util.stream.Collectors.groupingBy(t -> t.getEvent().getId()));

        return page.map(entity -> {
            var eventSessions = sessionsMap.getOrDefault(entity.getId(), java.util.Collections.emptyList());
            var eventTickets = ticketsMap.getOrDefault(entity.getId(), java.util.Collections.emptyList());

            // 도메인 로직 활용을 위한 변환
            var eventDomain = eventMapper.toDomain(entity);
            var sessionDomains = eventSessions.stream().map(sessionMapper::toDomain).toList();

            return hostEventMapper.toResponse(
                    entity,
                    eventSessions,
                    eventTickets,
                    eventDomain.getEffectiveStatus(sessionDomains),
                    eventDomain.getRecruitmentStatus(sessionDomains)
            );
        });
    }

    @Override
    public com.venueon.host.event.adapter.in.web.dto.HostEventDetailResponse getEventDetail(Long hostId, Long eventId) {
        EventJpaEntity event = hostEventJpaRepository.findByIdWithDetails(eventId)
                .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다. ID: " + eventId));

        if (!event.getCreator().getId().equals(hostId)) {
            throw new org.springframework.security.access.AccessDeniedException("본인의 강의 정보만 조회할 수 있습니다.");
        }

        var sessions = sessionJpaRepository.findByEventIdOrderBySortOrder(eventId);
        var tickets = ticketJpaRepository.findByEventIdIn(java.util.List.of(eventId));
        long totalRevenue = orderQueryRepository.sumRevenueByEventId(eventId);
        long totalAttendees = orderQueryRepository.countAttendeesByEventId(eventId);
        
        var hostProfileOpt = hostProfileJpaRepository.findByUserId(hostId);

        // 도메인 로직을 활용한 상태 계산 추가
        var eventDomain = eventMapper.toDomain(event);
        var sessionDomains = sessions.stream().map(sessionMapper::toDomain).toList();
        
        return hostEventMapper.toDetailResponse(
                event, 
                sessions, 
                tickets,
                totalRevenue, 
                totalAttendees,
                eventDomain.getEffectiveStatus(sessionDomains),
                eventDomain.getRecruitmentStatus(sessionDomains),
                hostProfileOpt.orElse(null)
        );
    }

    @Override
    public java.util.List<com.venueon.host.event.adapter.in.web.dto.AttendeeResponse> findAttendees(Long hostId, Long eventId) {
        EventJpaEntity event = hostEventJpaRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다. ID: " + eventId));

        if (!event.getCreator().getId().equals(hostId)) {
            throw new org.springframework.security.access.AccessDeniedException("본인의 강의 수강생 명단만 조회할 수 있습니다.");
        }

        return orderQueryRepository.findAttendeesByEventId(eventId);
    }
}
