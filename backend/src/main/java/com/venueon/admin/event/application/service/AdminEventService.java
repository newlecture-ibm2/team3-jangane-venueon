package com.venueon.admin.event.application.service;

import com.venueon.admin.event.adapter.in.web.dto.EventAdminDetailResponse;
import com.venueon.admin.event.adapter.in.web.dto.EventAdminResponse;
import com.venueon.event.adapter.in.web.dto.SessionResponse;
import com.venueon.event.adapter.out.persistence.EventSessionMapper;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.EventSessionJpaRepository;
import com.venueon.admin.event.application.port.in.AdminEventUseCase;
import com.venueon.event.domain.model.EventStatus;
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
    private final EventSessionJpaRepository sessionRepository;
    private final HostProfileJpaRepository hostProfileRepository;
    private final EventSessionMapper sessionMapper;

    @Override
    public Page<EventAdminResponse> getEvents(String status, Long categoryId, String keyword, Boolean isHidden, Pageable pageable) {
        log.info("AdminEventService.getEvents - status: {}, categoryId: {}, keyword: {}, isHidden: {}", status, categoryId, keyword, isHidden);
        
        Specification<EventJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.equals("ALL") && !status.isEmpty()) {
                predicates.add(root.get("status").in(mapToInternalStatuses(status)));
            }

            if (categoryId != null && categoryId > 0) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%"));
            }

            // 숨김 처리된 강의 필터링 로직 개선
            if (isHidden != null && isHidden) {
                // 체크됨: 숨겨진 강의만 보기
                predicates.add(cb.isTrue(root.get("isHidden")));
            } else {
                // 체크 안 됨: 노출 중인 강의만 보기 (기본 상태)
                predicates.add(cb.isFalse(root.get("isHidden")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EventJpaEntity> eventPage = eventRepository.findAll(spec, pageable);
        return eventPage.map(this::convertToResponse);
    }

    private List<EventStatus> mapToInternalStatuses(String displayStatus) {
        return switch (displayStatus) {
            case "READY" -> List.of(EventStatus.DRAFT, EventStatus.PREPARING);
            case "RECRUITING" -> List.of(EventStatus.PUBLISHED, EventStatus.ONGOING);
            case "CLOSED" -> List.of(EventStatus.ENDED, EventStatus.CANCELLED);
            default -> List.of();
        };
    }

    private String mapToDisplayStatus(EventStatus status) {
        return switch (status) {
            case DRAFT, PREPARING -> "READY";
            case PUBLISHED, ONGOING -> "RECRUITING";
            case ENDED, CANCELLED -> "CLOSED";
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
    public EventAdminDetailResponse getEventDetail(Long id) {
        log.info("AdminEventService.getEventDetail - id: {}", id);
        
        EventJpaEntity event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다. ID: " + id));
        
        List<EventSessionJpaEntity> sessions = sessionRepository.findByEventIdOrderBySortOrder(id);
        
        UserJpaEntity creator = event.getCreator();
        HostProfileJpaEntity hostProfile = hostProfileRepository.findByUserId(creator.getId()).orElse(null);
        
        return convertToDetailResponse(event, sessions, hostProfile);
    }

    private EventAdminDetailResponse convertToDetailResponse(EventJpaEntity entity, List<EventSessionJpaEntity> sessions, HostProfileJpaEntity hostProfile) {
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
                .type(entity.getType())
                .status(entity.getStatus())
                .displayStatus(mapToDisplayStatus(entity.getStatus()))
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "미지정")
                .location(entity.getLocation())
                .isOnline(entity.isOnline())
                .price(entity.getPrice())
                .maxAttendees(entity.getMaxAttendees())
                .thumbnailUrl(entity.getThumbnailUrl())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .hasSession(entity.isHasSession())
                .purchaseType(entity.getPurchaseType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .isHidden(entity.isHidden())
                .host(hostInfo)
                .sessions(sessionResponses)
                .build();
    }

    private EventAdminResponse convertToResponse(EventJpaEntity entity) {
        List<EventSessionJpaEntity> sessions = sessionRepository.findByEventIdOrderBySortOrder(entity.getId());
        int totalCurrentAttendees = sessions.stream()
                .mapToInt(EventSessionJpaEntity::getCurrentAttendees)
                .sum();

        return EventAdminResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .currentAttendees(totalCurrentAttendees)
                .createdAt(entity.getCreatedAt())
                .status(entity.getStatus())
                .displayStatus(mapToDisplayStatus(entity.getStatus()))
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "미지정")
                .isHidden(entity.isHidden())
                .build();
    }
}
