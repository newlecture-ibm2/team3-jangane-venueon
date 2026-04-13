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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            @RequestParam("status") Long statusId
    ) {
        Event updated = updateEventStatusUseCase.updateStatus(id, requesterId, requesterRole, statusId);
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
}
