package com.venueon.event.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.event.adapter.in.web.dto.SessionResponse;
import com.venueon.event.application.port.in.GetSessionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 공개 세션 조회 API — 누구나 접근 가능
 */
@RestController
@RequestMapping("/events/{eventId}/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final GetSessionUseCase getSessionUseCase;

    @GetMapping
    public ApiResponse<List<SessionResponse>> getSessionsByEventId(@PathVariable Long eventId) {
        var sessions = getSessionUseCase.getSessionsByEventId(eventId);
        var response = sessions.stream()
                .map(SessionResponse::from)
                .toList();

        return ApiResponse.success(response);
    }
}
