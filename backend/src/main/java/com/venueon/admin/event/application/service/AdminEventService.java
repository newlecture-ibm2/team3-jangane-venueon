package com.venueon.admin.event.application.service;

import com.venueon.admin.event.adapter.in.web.dto.*;
import com.venueon.common.dto.CodeDto;
import com.venueon.event.adapter.in.web.dto.SessionResponse;
import com.venueon.event.adapter.out.persistence.SessionMapper;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.admin.event.application.port.in.AdminEventUseCase;
import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.ticket.adapter.out.persistence.repository.TicketJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.HostProfileJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminEventService implements AdminEventUseCase {

    private final EventJpaRepository eventRepository;
    private final SessionJpaRepository sessionRepository;
    private final HostProfileJpaRepository hostProfileRepository;
    private final CategoryJpaRepository categoryRepository;
    private final TicketJpaRepository ticketRepository;
    private final SessionMapper sessionMapper;

    @Override
    public Page<EventAdminResponse> getEvents(String status, Long categoryId, String keyword, Boolean isHidden, Pageable pageable) {
        log.info("AdminEventService.getEvents - status: {}, categoryId: {}, keyword: {}, isHidden: {}", status, categoryId, keyword, isHidden);
        
        Specification<EventJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.equals("ALL") && !status.isEmpty()) {
                predicates.add(root.get("status").get("code").in(mapToInternalStatuses(status)));
            }

            if (categoryId != null && categoryId > 0) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%"));
            }

            if (isHidden != null && isHidden) {
                predicates.add(cb.isTrue(root.get("isHidden")));
            } else {
                predicates.add(cb.isFalse(root.get("isHidden")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EventJpaEntity> eventPage = eventRepository.findAll(spec, pageable);
        return eventPage.map(this::convertToResponse);
    }

    private List<String> mapToInternalStatuses(String displayStatus) {
        return switch (displayStatus) {
            case "READY" -> List.of("DRAFT", "PREPARING");
            case "RECRUITING" -> List.of("PUBLISHED", "ONGOING");
            case "CLOSED" -> List.of("ENDED", "CANCELLED");
            default -> List.of();
        };
    }

    private String mapToDisplayStatus(String statusCode) {
        return switch (statusCode) {
            case "DRAFT", "PREPARING" -> "READY";
            case "PUBLISHED", "ONGOING" -> "RECRUITING";
            case "ENDED", "CANCELLED" -> "CLOSED";
            default -> "UNKNOWN";
        };
    }

    @Override
    @Transactional
    public void toggleVisibility(Long id) {
        EventJpaEntity event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다. ID: " + id));
        event.toggleHidden();
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 강의입니다. ID: " + id);
        }
        eventRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void updateEvent(Long id, UpdateEventRequest request) {
        log.info("AdminEventService.updateEvent - id: {}", id);
        EventJpaEntity event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다. ID: " + id));
        CategoryJpaEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다. ID: " + request.getCategoryId()));
        event.updateBasicInfo(request.getTitle(), request.getDescription(), category, request.getThumbnailUrl());
    }

    @Override
    @Transactional
    public void updateSession(Long eventId, Long sessionId, UpdateSessionRequest request) {
        log.info("AdminEventService.updateSession - eventId: {}, sessionId: {}", eventId, sessionId);
        SessionJpaEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다. ID: " + sessionId));
        if (!session.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("해당 세션은 요청한 강의에 속해있지 않습니다.");
        }
        session.updateInfo(request.getTitle(), request.getDescription(), request.getStartTime(), request.getEndTime(),
                request.getLocation(), request.isOnline(), request.getMaxAttendees());
    }

    @Override
    @Transactional
    public void updateTicket(Long eventId, Long ticketId, UpdateTicketRequest request) {
        log.info("AdminEventService.updateTicket - eventId: {}, ticketId: {}", eventId, ticketId);
        TicketJpaEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 티켓입니다. ID: " + ticketId));
        if (!ticket.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("해당 티켓은 요청한 강의에 속해있지 않습니다.");
        }
        ticket.update(request.getName(), request.getDescription(), request.getPrice(), request.getOriginalPrice(),
                request.getMaxQuantity(), ticket.getSoldCount(), ticket.isAllSessions(), ticket.getSortOrder(),
                request.isActive(), ticket.getSalesStart(), ticket.getSalesEnd());
    }

    @Override
    public EventAdminDetailResponse getEventDetail(Long id) {
        log.info("AdminEventService.getEventDetail - id: {}", id);
        EventJpaEntity event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다. ID: " + id));
        List<SessionJpaEntity> sessions = sessionRepository.findByEventIdOrderBySortOrder(id);
        List<TicketJpaEntity> tickets = ticketRepository.findByEventIdOrderBySortOrder(id);
        UserJpaEntity creator = event.getCreator();
        HostProfileJpaEntity hostProfile = hostProfileRepository.findByUserId(creator.getId()).orElse(null);
        return convertToDetailResponse(event, sessions, tickets, hostProfile);
    }

    private EventAdminDetailResponse convertToDetailResponse(EventJpaEntity entity, List<SessionJpaEntity> sessions, List<TicketJpaEntity> tickets, HostProfileJpaEntity hostProfile) {
        List<SessionResponse> sessionResponses = sessions.stream()
                .map(sessionMapper::toDomain)
                .map(SessionResponse::from)
                .toList();

        EventAdminDetailResponse.HostInfo hostInfo = EventAdminDetailResponse.HostInfo.builder()
                .userId(entity.getCreator().getId())
                .email(entity.getCreator().getEmail())
                .nickname(entity.getCreator().getNickname())
                .profileImg(entity.getCreator().getProfileImg())
                .orgName(hostProfile != null ? hostProfile.getOrgName() : null)
                .orgNumber(hostProfile != null ? hostProfile.getOrgNumber() : null)
                .managerName(hostProfile != null ? hostProfile.getManagerName() : null)
                .orgDescription(hostProfile != null ? hostProfile.getOrgDescription() : null)
                .build();

        return EventAdminDetailResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .type(entity.getType() != null ? CodeDto.of(entity.getType().getId(), entity.getType().getName()) : null)
                .status(entity.getStatus() != null ? CodeDto.of(entity.getStatus().getId(), entity.getStatus().getLabel()) : null)
                .displayStatus(mapToDisplayStatus(entity.getStatus().getCode()))
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "미지정")
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .isHidden(entity.isHidden())
                .host(hostInfo)
                .sessions(sessionResponses)
                .tickets(tickets.stream().map(this::convertToTicketInfo).toList())
                .build();
    }

    private EventAdminDetailResponse.TicketInfo convertToTicketInfo(TicketJpaEntity ticket) {
        return EventAdminDetailResponse.TicketInfo.builder()
                .id(ticket.getId())
                .name(ticket.getName())
                .price(ticket.getPrice())
                .originalPrice(ticket.getOriginalPrice())
                .maxQuantity(ticket.getMaxQuantity())
                .soldCount(ticket.getSoldCount())
                .isActive(ticket.isActive())
                .build();
    }

    private EventAdminResponse convertToResponse(EventJpaEntity entity) {
        List<SessionJpaEntity> sessions = sessionRepository.findByEventIdOrderBySortOrder(entity.getId());
        int totalCurrentAttendees = sessions.stream()
                .mapToInt(SessionJpaEntity::getCurrentAttendees)
                .sum();
        return EventAdminResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .currentAttendees(totalCurrentAttendees)
                .createdAt(entity.getCreatedAt())
                .status(entity.getStatus() != null ? CodeDto.of(entity.getStatus().getId(), entity.getStatus().getLabel()) : null)
                .displayStatus(mapToDisplayStatus(entity.getStatus().getCode()))
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "미지정")
                .isHidden(entity.isHidden())
                .build();
    }
}
