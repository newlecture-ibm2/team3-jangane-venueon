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
 * v8: 모집 수동관리 API, 주소 필드(addressRoad, addressDetail) 추가
 */
@RestController
@RequestMapping("/host/events/{eventId}/sessions")
@RequiredArgsConstructor
public class HostSessionController {

    private final CreateSessionUseCase createSessionUseCase;
    private final UpdateSessionUseCase updateSessionUseCase;
    private final DeleteSessionUseCase deleteSessionUseCase;
    private final ReorderSessionUseCase reorderSessionUseCase;
    private final ManageRecruitmentUseCase manageRecruitmentUseCase;

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
                request.addressRoad(),
                request.addressDetail(),
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
                request.addressRoad(),
                request.addressDetail(),
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
     * Body: { "status": "PENDING" | "OPEN" | "CLOSED" | "AUTO" }
     */
    @PatchMapping("/{sessionId}/recruitment")
    public ApiResponse<SessionResponse> changeRecruitmentStatus(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String userRole,
            @RequestBody RecruitmentStatusRequest request) {

        var command = new ManageRecruitmentUseCase.ChangeRecruitmentStatusCommand(
                sessionId, eventId, hostId, userRole, request.statusId()
        );
        var session = manageRecruitmentUseCase.changeRecruitmentStatus(command);
        return ApiResponse.success(SessionResponse.from(session));
    }

    /**
     * 세션별 진행 상태 강제 변경
     * PATCH /host/events/{eventId}/sessions/{sessionId}/status
     * Body: { "status": "PUBLISHED" | "ONGOING" | "ENDED" | "CANCELLED" | "AUTO" }
     */
    @PatchMapping("/{sessionId}/status")
    public ApiResponse<SessionResponse> changeSessionStatus(
            @PathVariable Long eventId,
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long hostId,
            @RequestHeader(value = "X-User-Role", defaultValue = "HOST") String userRole,
            @RequestBody SessionStatusRequest request) {

        var command = new ManageRecruitmentUseCase.ChangeSessionStatusCommand(
                sessionId, eventId, hostId, userRole, request.statusId()
        );
        var session = manageRecruitmentUseCase.changeSessionStatus(command);
        return ApiResponse.success(SessionResponse.from(session));
    }

    /**
     * 모집 상태 변경 요청 DTO
     */
    public record RecruitmentStatusRequest(Long statusId) {}

    /**
     * 진행 상태 변경 요청 DTO
     */
    public record SessionStatusRequest(Long statusId) {}
}
