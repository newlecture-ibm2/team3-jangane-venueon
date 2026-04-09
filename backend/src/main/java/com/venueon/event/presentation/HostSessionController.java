package com.venueon.event.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.event.adapter.in.web.dto.*;
import com.venueon.event.application.port.in.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/host/events/{eventId}/sessions")
@RequiredArgsConstructor
public class HostSessionController {

    private final CreateSessionUseCase createSessionUseCase;
    private final UpdateSessionUseCase updateSessionUseCase;
    private final DeleteSessionUseCase deleteSessionUseCase;
    private final ReorderSessionUseCase reorderSessionUseCase;

    @PostMapping
    public ApiResponse<SessionResponse> createSession(
            @PathVariable Long eventId,
            @RequestHeader("X-User-Id") Long hostId,
            @Valid @RequestBody SessionCreateRequest request) {

        var command = new CreateSessionUseCase.CreateSessionCommand(
                eventId,
                hostId,
                request.title(),
                request.description(),
                request.sortOrder(),
                request.startTime(),
                request.endTime(),
                request.location(),
                request.isOnline(),
                request.onlineLink(),
                request.price(),
                request.maxAttendees()
        );

        var session = createSessionUseCase.createSession(command);
        return ApiResponse.success(SessionResponse.from(session));
    }

    @PutMapping("/{sessionId}")
    public ApiResponse<SessionResponse> updateSession(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId,
            @Valid @RequestBody SessionUpdateRequest request) {

        var command = new UpdateSessionUseCase.UpdateSessionCommand(
                sessionId,
                eventId,
                hostId,
                request.title(),
                request.description(),
                request.sortOrder(),
                request.startTime(),
                request.endTime(),
                request.location(),
                request.isOnline(),
                request.onlineLink(),
                request.price(),
                request.maxAttendees()
        );

        var session = updateSessionUseCase.updateSession(command);
        return ApiResponse.success(SessionResponse.from(session));
    }

    @DeleteMapping("/{sessionId}")
    public ApiResponse<Void> deleteSession(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId) {

        deleteSessionUseCase.deleteSession(sessionId, eventId, hostId);
        return ApiResponse.success(null);
    }

    @PatchMapping("/reorder")
    public ApiResponse<Void> reorderSessions(
            @PathVariable Long eventId,
            @RequestHeader("X-User-Id") Long hostId,
            @Valid @RequestBody SessionReorderRequest request) {

        reorderSessionUseCase.reorderSessions(eventId, hostId, request.sessionIds());
        return ApiResponse.success(null);
    }
}
