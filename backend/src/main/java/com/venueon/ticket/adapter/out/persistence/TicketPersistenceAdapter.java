package com.venueon.ticket.adapter.out.persistence;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionJpaEntity;
import com.venueon.ticket.adapter.out.persistence.repository.TicketJpaRepository;
import com.venueon.ticket.adapter.out.persistence.repository.TicketSessionJpaRepository;
import com.venueon.ticket.application.port.out.TicketRepositoryPort;
import com.venueon.ticket.domain.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Ticket 영속성 어댑터 — TicketRepositoryPort 구현
 */
@Component
@RequiredArgsConstructor
public class TicketPersistenceAdapter implements TicketRepositoryPort {

    private final TicketJpaRepository ticketJpaRepository;
    private final TicketSessionJpaRepository ticketSessionJpaRepository;
    private final EventJpaRepository eventJpaRepository;
    private final SessionJpaRepository sessionJpaRepository;
    private final TicketMapper ticketMapper;

    @Override
    @Transactional
    public Ticket save(Ticket ticket, Long eventId, List<Long> sessionIds) {
        EventJpaEntity event = eventJpaRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + eventId));

        TicketJpaEntity entity;
        if (ticket.getId() != null) {
            // 수정
            entity = ticketJpaRepository.findById(ticket.getId())
                    .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + ticket.getId()));
            // 기존 매핑 삭제
            entity.getTicketSessions().clear();
            // 엔티티 필드 업데이트
            entity = TicketJpaEntity.builder()
                    .id(entity.getId())
                    .event(event)
                    .name(ticket.getName())
                    .description(ticket.getDescription())
                    .price(ticket.getPrice())
                    .originalPrice(ticket.getOriginalPrice())
                    .maxQuantity(ticket.getMaxQuantity())
                    .soldCount(ticket.getSoldCount())
                    .isAllSessions(ticket.getIsAllSessions())
                    .sortOrder(ticket.getSortOrder())
                    .isActive(ticket.getIsActive())
                    .salesStart(ticket.getSalesStart())
                    .salesEnd(ticket.getSalesEnd())
                    .createdAt(ticket.getCreatedAt())
                    .build();
        } else {
            // 신규 생성
            entity = TicketJpaEntity.builder()
                    .event(event)
                    .name(ticket.getName())
                    .description(ticket.getDescription())
                    .price(ticket.getPrice())
                    .originalPrice(ticket.getOriginalPrice())
                    .maxQuantity(ticket.getMaxQuantity())
                    .soldCount(0)
                    .isAllSessions(ticket.getIsAllSessions())
                    .sortOrder(ticket.getSortOrder())
                    .isActive(ticket.getIsActive())
                    .salesStart(ticket.getSalesStart())
                    .salesEnd(ticket.getSalesEnd())
                    .build();
        }

        TicketJpaEntity saved = ticketJpaRepository.save(entity);

        // 세션 매핑 저장 (isAllSessions=false인 경우에만)
        if (!ticket.getIsAllSessions() && sessionIds != null && !sessionIds.isEmpty()) {
            for (Long sessionId : sessionIds) {
                SessionJpaEntity session = sessionJpaRepository.findById(sessionId)
                        .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다. ID: " + sessionId));
                ticketSessionJpaRepository.save(
                        TicketSessionJpaEntity.builder()
                                .ticket(saved)
                                .session(session)
                                .build()
                );
            }
        }

        return ticketMapper.toDomain(
                ticketJpaRepository.findById(saved.getId()).orElseThrow()
        );
    }

    @Override
    public Optional<Ticket> findById(Long id) {
        return ticketJpaRepository.findById(id)
                .map(ticketMapper::toDomain);
    }

    @Override
    public List<Ticket> findByEventId(Long eventId) {
        return ticketJpaRepository.findByEventIdOrderBySortOrder(eventId).stream()
                .map(ticketMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByEventIds(List<Long> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) return List.of();
        return ticketJpaRepository.findByEventIdIn(eventIds).stream()
                .map(ticketMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        ticketSessionJpaRepository.deleteByTicketId(id);
        ticketJpaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void updateSoldCount(Long ticketId, int soldCount) {
        TicketJpaEntity entity = ticketJpaRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + ticketId));
        ticketJpaRepository.save(
                TicketJpaEntity.builder()
                        .id(entity.getId())
                        .event(entity.getEvent())
                        .name(entity.getName())
                        .description(entity.getDescription())
                        .price(entity.getPrice())
                        .originalPrice(entity.getOriginalPrice())
                        .maxQuantity(entity.getMaxQuantity())
                        .soldCount(soldCount)
                        .isAllSessions(entity.isAllSessions())
                        .sortOrder(entity.getSortOrder())
                        .isActive(entity.isActive())
                        .salesStart(entity.getSalesStart())
                        .salesEnd(entity.getSalesEnd())
                        .createdAt(entity.getCreatedAt())
                        .build()
        );
    }
}
