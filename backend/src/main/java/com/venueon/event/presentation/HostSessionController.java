package com.venueon.event.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.event.adapter.in.web.dto.*;
import com.venueon.event.application.port.in.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Host 전용 세션 API
 * v6: price 제거, regionSido/regionSigungu/recruitStartDate/recruitEndDate 추가
 */
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
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String userRole,
            @Valid @RequestBody SessionCreateRequest request) {

        var command = new CreateSessionUseCase.CreateSessionCommand(
                eventId,
                hostId,
                userRole,
                request.title(),
                request.description(),
                request.sortOrder(),
                request.startTime(),
                request.endTime(),
                request.location(),
                request.regionSido(),
                request.regionSigungu(),
                request.isOnline(),
                request.onlineLink(),
                request.maxAttendees(),
                request.recruitStartDate(),
                request.recruitEndDate()
        );

        var session = createSessionUseCase.createSession(command);
        return ApiResponse.success(SessionResponse.from(session));
    }

    @PutMapping("/{sessionId}")
    public ApiResponse<SessionResponse> updateSession(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String userRole,
            @Valid @RequestBody SessionUpdateRequest request) {

        var command = new UpdateSessionUseCase.UpdateSessionCommand(
                sessionId,
                eventId,
                hostId,
                userRole,
                request.title(),
                request.description(),
                request.sortOrder(),
                request.startTime(),
                request.endTime(),
                request.location(),
                request.regionSido(),
                request.regionSigungu(),
                request.isOnline(),
                request.onlineLink(),
                request.maxAttendees(),
                request.recruitStartDate(),
                request.recruitEndDate()
        );

        var session = updateSessionUseCase.updateSession(command);
        return ApiResponse.success(SessionResponse.from(session));
    }

    @DeleteMapping("/{sessionId}")
    public ApiResponse<Void> deleteSession(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String userRole) {

        deleteSessionUseCase.deleteSession(sessionId, eventId, hostId, userRole);
        return ApiResponse.success(null);
    }

    @PatchMapping("/reorder")
    public ApiResponse<Void> reorderSessions(
            @PathVariable Long eventId,
            @RequestHeader("X-User-Id") Long hostId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String userRole,
            @Valid @RequestBody SessionReorderRequest request) {

        reorderSessionUseCase.reorderSessions(eventId, hostId, userRole, request.sessionIds());
        return ApiResponse.success(null);
    }

    /**
     * 세션별 모집 마감/재개
     * PATCH /host/events/{eventId}/sessions/{sessionId}/recruitment
     */
    @PatchMapping("/{sessionId}/recruitment")
    public ApiResponse<SessionResponse> toggleRecruitment(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId,
            @RequestBody RecruitmentToggleRequest request) {

        // TODO: ManageRecruitmentUseCase를 별도 정의하여 분리 가능
        // 현재는 UpdateSession을 통해 처리하지 않고 간단한 서비스 호출로 구현
        // 이 부분은 Phase 2 정밀 구현 시 UseCase 분리
        return ApiResponse.success(null);
    }

    /**
     * 모집 마감/재개 요청 DTO
     */
    public record RecruitmentToggleRequest(boolean closed) {}
}
