package com.venueon.ticket.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.ticket.adapter.in.web.dto.TicketResponse;
import com.venueon.ticket.application.service.TicketQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 티켓 공개 조회 컨트롤러
 * GET /events/{eventId}/tickets
 * 정원연동: isPurchasable, unavailableReason, recruitEndDate 포함 응답
 */
@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketQueryService ticketQueryService;

    /**
     * 이벤트의 티켓 목록 조회 (공개) — 정원 연동 포함
     * 각 티켓의 연결된 세션 정원/모집 상태를 종합하여 isPurchasable 계산
     */
    @GetMapping("/events/{eventId}/tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTickets(@PathVariable Long eventId) {
        List<TicketResponse> tickets = ticketQueryService.getTicketsWithPurchasability(eventId);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }
}

