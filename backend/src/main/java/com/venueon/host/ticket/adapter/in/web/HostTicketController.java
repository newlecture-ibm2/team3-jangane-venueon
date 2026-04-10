package com.venueon.host.ticket.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.host.ticket.adapter.in.web.dto.TicketCreateRequest;
import com.venueon.host.ticket.adapter.in.web.dto.TicketUpdateRequest;
import com.venueon.host.ticket.application.port.in.CreateTicketUseCase;
import com.venueon.host.ticket.application.port.in.DeleteTicketUseCase;
import com.venueon.host.ticket.application.port.in.UpdateTicketUseCase;
import com.venueon.ticket.adapter.in.web.dto.TicketResponse;
import com.venueon.ticket.domain.model.Ticket;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 호스트 티켓 CUD 컨트롤러
 * POST   /host/events/{eventId}/tickets
 * PUT    /host/tickets/{ticketId}
 * DELETE /host/tickets/{ticketId}
 */
@RestController
@RequestMapping("/host")
@RequiredArgsConstructor
public class HostTicketController {

    private final CreateTicketUseCase createTicketUseCase;
    private final UpdateTicketUseCase updateTicketUseCase;
    private final DeleteTicketUseCase deleteTicketUseCase;

    /**
     * 티켓 생성
     * POST /host/events/{eventId}/tickets
     */
    @PostMapping("/events/{eventId}/tickets")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @PathVariable Long eventId,
            @RequestHeader(value = "X-Host-Id", required = false) Long headerHostId,
            Authentication authentication,
            @Valid @RequestBody TicketCreateRequest request) {

        Long hostId = resolveHostId(headerHostId, authentication);

        CreateTicketUseCase.CreateTicketCommand command = new CreateTicketUseCase.CreateTicketCommand(
                eventId, hostId,
                request.name(), request.description(),
                request.price(), request.originalPrice(),
                request.maxQuantity(), request.isAllSessions(),
                request.sessionIds(), request.sortOrder(),
                request.salesStart(), request.salesEnd()
        );
        Ticket ticket = createTicketUseCase.createTicket(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(TicketResponse.from(ticket)));
    }

    /**
     * 티켓 수정
     * PUT /host/tickets/{ticketId}
     */
    @PutMapping("/tickets/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable Long ticketId,
            @RequestHeader(value = "X-Host-Id", required = false) Long headerHostId,
            Authentication authentication,
            @Valid @RequestBody TicketUpdateRequest request) {

        Long hostId = resolveHostId(headerHostId, authentication);

        UpdateTicketUseCase.UpdateTicketCommand command = new UpdateTicketUseCase.UpdateTicketCommand(
                ticketId, hostId,
                request.name(), request.description(),
                request.price(), request.originalPrice(),
                request.maxQuantity(), request.isAllSessions(),
                request.sessionIds(), request.sortOrder(),
                request.isActive(),
                request.salesStart(), request.salesEnd()
        );
        Ticket ticket = updateTicketUseCase.updateTicket(command);
        return ResponseEntity.ok(ApiResponse.success(TicketResponse.from(ticket)));
    }

    /**
     * 티켓 삭제
     * DELETE /host/tickets/{ticketId}
     */
    @DeleteMapping("/tickets/{ticketId}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long ticketId,
            @RequestHeader(value = "X-Host-Id", required = false) Long headerHostId,
            Authentication authentication) {

        Long hostId = resolveHostId(headerHostId, authentication);
        deleteTicketUseCase.deleteTicket(ticketId, hostId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private Long resolveHostId(Long headerHostId, Authentication authentication) {
        if (headerHostId != null) return headerHostId;
        if (authentication != null && authentication.getName() != null) {
            // JWT에서 실제 userId 추출 — 향후 개선
            return 1L; // 임시 기본값
        }
        throw new IllegalStateException("호스트 ID를 확인할 수 없습니다.");
    }
}
