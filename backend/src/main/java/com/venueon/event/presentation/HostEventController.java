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
import com.venueon.host.presentation.HostAuthSupport;
import com.venueon.host.application.port.in.GetHostEventsUseCase;
import com.venueon.host.dto.HostEventDetailResponse;
import com.venueon.host.dto.HostEventResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Host 전용 이벤트 API — 인증된 Host만 접근 가능
 * Authentication 객체에서 hostId를 추출하여 사용
 */
@Slf4j
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
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventDetailResponse> createEvent(
            Authentication authentication,
            @Valid @RequestBody EventCreateRequest request
    ) {
        Long creatorId = hostAuthSupport.extractUserId(authentication);
        log.debug("POST /host/events — creatorId={}", creatorId);
        Event created = createEventUseCase.createEvent(request.toCommand(creatorId));
        return ApiResponse.success(EventDetailResponse.from(created));
    }

    /**
     * 이벤트 상태 변경 (DRAFT → PUBLISHED 등)
     * PATCH /host/events/{id}/status?status=PUBLISHED
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<EventDetailResponse> updateEventStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam EventStatus status
    ) {
        Long requesterId = hostAuthSupport.extractUserId(authentication);
        log.debug("PATCH /host/events/{}/status — requesterId={}, status={}", id, requesterId, status);
        Event updated = updateEventStatusUseCase.updateStatus(id, requesterId, status);
        return ApiResponse.success(EventDetailResponse.from(updated));
    }

    /**
     * 이벤트 삭제
     * DELETE /host/events/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long requesterId = hostAuthSupport.extractUserId(authentication);
        log.debug("DELETE /host/events/{} — requesterId={}", id, requesterId);
        deleteEventUseCase.deleteEvent(id, requesterId, "HOST");
    }

    /**
     * 이벤트 수정
     * PUT /host/events/{id}
     */
    @PutMapping("/{id}")
    public ApiResponse<EventDetailResponse> updateEvent(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequest request
    ) {
        Long requesterId = hostAuthSupport.extractUserId(authentication);
        log.debug("PUT /host/events/{} — requesterId={}", id, requesterId);
        Event updated = updateEventUseCase.updateEvent(request.toCommand(id, requesterId, "HOST"));
        return ApiResponse.success(EventDetailResponse.from(updated));
    }

    /**
     * 호스트 자신의 이벤트 목록 조회
     */
    @GetMapping
    public ApiResponse<Page<HostEventResponse>> getMyEvents(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/events — hostId={}, status={}, page={}, size={}", hostId, status, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostEvents(hostId, status, pageable);

        return ApiResponse.success(result);
    }

    /**
     * 호스트 자신의 임시저장(DRAFT) 이벤트 목록 조회
     */
    @GetMapping("/drafts")
    public ApiResponse<Page<HostEventResponse>> getMyDraftEvents(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/events/drafts — hostId={}, page={}, size={}", hostId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostDraftEvents(hostId, pageable);

        return ApiResponse.success(result);
    }

    /**
     * 호스트 이벤트 상세 단건 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<HostEventDetailResponse> getMyEventDetail(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/events/{} — hostId={}", id, hostId);

        HostEventDetailResponse result = getHostEventsUseCase.getHostEventDetail(hostId, id);

        return ApiResponse.success(result);
    }
}
