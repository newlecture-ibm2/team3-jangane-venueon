package com.venueon.ticket.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.ticket.adapter.in.web.dto.TicketResponse;
import com.venueon.ticket.application.port.in.GetTicketUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 티켓 공개 조회 컨트롤러
 * GET /events/{eventId}/tickets
 */
@RestController
@RequiredArgsConstructor
public class TicketController {

    private final GetTicketUseCase getTicketUseCase;

    /**
     * 이벤트의 티켓 목록 조회 (공개)
     */
    @GetMapping("/events/{eventId}/tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTickets(@PathVariable Long eventId) {
        List<TicketResponse> tickets = getTicketUseCase.getTicketsByEventId(eventId).stream()
                .map(TicketResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }
}
