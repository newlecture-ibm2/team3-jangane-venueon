package com.venueon.event.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.event.application.port.in.CreateEventUseCase;
import com.venueon.event.application.port.in.DeleteEventUseCase;
import com.venueon.event.application.port.in.UpdateEventStatusUseCase;
import com.venueon.event.application.port.in.UpdateEventUseCase;
import com.venueon.event.application.port.in.CreateSessionUseCase;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.domain.model.Event;
import com.venueon.community.application.port.in.CreateCommunityUseCase;
import com.venueon.community.application.port.in.dto.CreateCommunityRequest;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 이벤트 생성/수정/삭제 서비스 (Command 전용)
 * v6: price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
@Transactional
public class EventCommandService implements CreateEventUseCase, UpdateEventStatusUseCase, DeleteEventUseCase, UpdateEventUseCase {

    private final EventRepositoryPort eventRepositoryPort;
    private final CreateSessionUseCase createSessionUseCase;
    private final CreateCommunityUseCase createCommunityUseCase;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    public Event createEvent(CreateEventCommand command) {
        Event event = new Event(
                null,                       // id (auto-generated)
                command.creatorId(),
                command.categoryId(),
                command.title(),
                command.description(),
                command.detailContent(),
                com.venueon.common.model.DomainCode.of(command.typeId(), "이벤트타입"), // DB 맵핑용
                com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID, "임시저장"),          // 최초 생성 시 항상 DRAFT
                command.thumbnailUrl(),
                command.hasSession(),
                false,                      // isHidden
                LocalDateTime.now(),        // createdAt
                LocalDateTime.now()         // updatedAt
        );

        Event savedEvent = eventRepositoryPort.save(event);

        if (!savedEvent.getHasSession()) {
            createSessionUseCase.createDefaultSession(savedEvent);
        } else if (command.sessions() != null && !command.sessions().isEmpty()) {
            command.sessions().forEach(sessionReq -> {
                CreateSessionUseCase.CreateSessionCommand sessionCommand = new CreateSessionUseCase.CreateSessionCommand(
                        savedEvent.getId(),
                        command.creatorId(),
                        "HOST", // 이벤트 생성자는 HOST 역할
                        sessionReq.title(),
                        sessionReq.description(),
                        sessionReq.sortOrder(),
                        sessionReq.startTime(),
                        sessionReq.endTime(),
                        sessionReq.location(),
                        sessionReq.regionSido(),
                        sessionReq.regionSigungu(),
                        null, // addressRoad
                        null, // addressDetail
                        sessionReq.isOnline(),
                        sessionReq.onlineLink(),
                        sessionReq.maxAttendees(),
                        sessionReq.recruitStartDate(),
                        sessionReq.recruitEndDate()
                );
                createSessionUseCase.createSession(sessionCommand);
            });
        }
        
        // 커뮤니티 자동 생성
        try {
            User creator = userRepositoryPort.findById(savedEvent.getCreatorId())
                    .orElseThrow(() -> new IllegalArgumentException("이벤트 생성자를 찾을 수 없습니다."));
            
            CreateCommunityRequest communityRequest = new CreateCommunityRequest(
                    savedEvent.getId(),
                    savedEvent.getTitle() + " 수료자 전용",
                    savedEvent.getTitle() + " 클래스 수료자들을 위한 프라이빗 커뮤니티입니다.",
                    true, // 공개로 변경
                    com.venueon.community.domain.model.CommunityType.HOST_AUTO
            );
            
            createCommunityUseCase.createCommunity(communityRequest, creator.getEmail());
            log.info("[EventCreate] Community automatically created for event: {}", savedEvent.getId());
        } catch (Exception e) {
            log.error("[EventCreate] Failed to create automatic community for event: {}", savedEvent.getId(), e);
            // 커뮤니티 생성 실패가 부모 트랜잭션을 롤백하게 할지는 정책에 따라 결정 (현재는 로그만 남김)
        }

        return savedEvent;
    }

    @Override
    public Event updateStatus(Long eventId, Long requesterId, String requesterRole, Long newStatusId) {
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + eventId));

        // ADMIN 역할이면 소유권 검증 우회
        if (!"ADMIN".equalsIgnoreCase(requesterRole) && !event.isOwnedBy(requesterId)) {
            throw new IllegalStateException("이벤트 상태 변경 권한이 없습니다.");
        }

        // 도메인 비즈니스 로직 위임
        if (newStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID)) event.revertToDraft();
        else if (newStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID)) event.publish();
        else if (newStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID)) event.end();
        else if (newStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_CANCELLED_ID)) event.cancel();
        else throw new IllegalArgumentException("지원하지 않는 상태 변경입니다: " + newStatusId);

        return eventRepositoryPort.save(event);
    }

    @Override
    public Event updateEvent(UpdateEventCommand command) {
        Event event = eventRepositoryPort.findById(command.eventId())
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + command.eventId()));

        if (!"ADMIN".equals(command.requesterRole()) && !event.isOwnedBy(command.requesterId())) {
            throw new IllegalStateException("이벤트 수정 권한이 없습니다.");
        }

        event.updateDetails(
                command.categoryId(),
                command.title(),
                command.description(),
                command.detailContent(),
                com.venueon.common.model.DomainCode.of(command.typeId(), "이벤트타입"),
                command.thumbnailUrl(),
                command.hasSession()
        );

        return eventRepositoryPort.save(event);
    }

    @Override
    public void deleteEvent(Long eventId, Long requesterId, String requesterRole) {
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + eventId));

        if (!"ADMIN".equals(requesterRole) && !event.isOwnedBy(requesterId)) {
            throw new IllegalStateException("이벤트 삭제 권한이 없습니다.");
        }

        eventRepositoryPort.deleteById(eventId);
    }
}
