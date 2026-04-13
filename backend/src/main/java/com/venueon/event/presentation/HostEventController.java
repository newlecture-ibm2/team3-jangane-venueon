package com.venueon.event.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.event.adapter.in.web.dto.EventCreateRequest;
import com.venueon.event.adapter.in.web.dto.EventDetailResponse;
import com.venueon.event.adapter.in.web.dto.EventUpdateRequest;
import com.venueon.event.application.port.in.CreateEventUseCase;
import com.venueon.event.application.port.in.DeleteEventUseCase;
import com.venueon.event.application.port.in.UpdateEventStatusUseCase;
import com.venueon.event.application.port.in.UpdateEventUseCase;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.host.application.port.in.GetHostEventsUseCase;
import com.venueon.host.dto.HostEventResponse;
import com.venueon.host.presentation.HostAuthSupport;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Host 전용 이벤트 API — 인증된 Host만 접근 가능
 */
@RestController
@RequestMapping("/host/events")
@RequiredArgsConstructor
public class HostEventController {

    private final CreateEventUseCase createEventUseCase;
    private final UpdateEventStatusUseCase updateEventStatusUseCase;
    private final DeleteEventUseCase deleteEventUseCase;
    private final UpdateEventUseCase updateEventUseCase;
    private final GetHostEventsUseCase getHostEventsUseCase;
    private final HostAuthSupport hostAuthSupport;

    /**
     * 이벤트 생성
     * POST /host/events
     *
     * TODO: JWT에서 creatorId 추출 (현재는 헤더로 임시 전달)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventDetailResponse> createEvent(
            @RequestHeader("X-User-Id") Long creatorId,
            @Valid @RequestBody EventCreateRequest request
    ) {
        Event created = createEventUseCase.createEvent(request.toCommand(creatorId));
        return ApiResponse.success(EventDetailResponse.from(created));
    }

    /**
     * 이벤트 상태 변경 (DRAFT → PUBLISHED 등)
     * PATCH /host/events/{id}/status?status=PUBLISHED
     *
     * TODO: JWT에서 requesterId 추출
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<EventDetailResponse> updateEventStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String requesterRole,
            @RequestParam EventStatus status
    ) {
        Event updated = updateEventStatusUseCase.updateStatus(id, requesterId, requesterRole, status);
        return ApiResponse.success(EventDetailResponse.from(updated));
    }

    /**
     * 이벤트 삭제
     * DELETE /host/events/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String requesterRole
    ) {
        deleteEventUseCase.deleteEvent(id, requesterId, requesterRole);
    }

    /**
     * 이벤트 수정
     * PUT /host/events/{id}
     */
    @PutMapping("/{id}")
    public ApiResponse<EventDetailResponse> updateEvent(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String requesterRole,
            @Valid @RequestBody EventUpdateRequest request
    ) {
        Event updated = updateEventUseCase.updateEvent(request.toCommand(id, requesterId, requesterRole));
        return ApiResponse.success(EventDetailResponse.from(updated));
    }

    /**
     * 호스트 이벤트 목록 조회
     */
    @GetMapping
    public ApiResponse<Page<HostEventResponse>> getMyEvents(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostEvents(hostId, status, pageable);
        return ApiResponse.success(result);
    }

    /**
     * 호스트 임시 저장 리스트 조회
     */
    @GetMapping("/drafts")
    public ApiResponse<Page<HostEventResponse>> getMyDraftEvents(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostDraftEvents(hostId, pageable);
        return ApiResponse.success(result);
    }

    /**
     * 호스트 이벤트 상세 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<HostEventResponse> getMyEventDetail(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        HostEventResponse result = getHostEventsUseCase.getHostEvent(hostId, id);
        return ApiResponse.success(result);
    }
}
