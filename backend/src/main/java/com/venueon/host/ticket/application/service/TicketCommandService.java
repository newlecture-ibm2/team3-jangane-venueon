package com.venueon.host.ticket.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.event.application.port.out.EventRepositoryPort;
import com.venueon.event.application.port.out.SessionPort;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.Session;
import com.venueon.host.ticket.application.port.in.CreateTicketUseCase;
import com.venueon.host.ticket.application.port.in.DeleteTicketUseCase;
import com.venueon.host.ticket.application.port.in.UpdateTicketUseCase;
import com.venueon.ticket.application.port.out.TicketRepositoryPort;
import com.venueon.ticket.domain.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 CUD 서비스 (호스트 전용)
 */
@UseCase
@RequiredArgsConstructor
@Transactional
public class TicketCommandService implements CreateTicketUseCase, UpdateTicketUseCase, DeleteTicketUseCase {

    private final TicketRepositoryPort ticketRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final SessionPort sessionPort;

    @Override
    public Ticket createTicket(CreateTicketCommand command) {
        // 1. 이벤트 존재 확인
        Event event = eventRepositoryPort.findById(command.eventId())
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + command.eventId()));

        // 2. 소유자 확인
        if (!event.isOwnedBy(command.hostId())) {
            throw new IllegalStateException("티켓 생성 권한이 없습니다.");
        }

        // 3. isAllSessions=false면 sessionIds 필수
        if (!command.isAllSessions()) {
            if (command.sessionIds() == null || command.sessionIds().isEmpty()) {
                throw new IllegalArgumentException("개별 세션 티켓은 세션 ID를 최소 1개 이상 지정해야 합니다.");
            }
            // 4. sessionIds가 해당 이벤트의 세션인지 확인
            for (Long sessionId : command.sessionIds()) {
                Session session = sessionPort.findById(sessionId)
                        .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다. ID: " + sessionId));
                if (!session.getEventId().equals(command.eventId())) {
                    throw new IllegalArgumentException("세션 " + sessionId + "은 이벤트 " + command.eventId() + "에 속하지 않습니다.");
                }
            }
        }

        // 5. 도메인 모델 생성
        Ticket ticket = new Ticket(
                null,
                command.eventId(),
                command.name(),
                command.description(),
                command.price(),
                command.originalPrice(),
                command.maxQuantity(),
                0, // soldCount
                command.isAllSessions(),
                command.sortOrder(),
                true, // isActive
                command.salesStart(),
                command.salesEnd(),
                command.sessionIds(),
                LocalDateTime.now(),
                null
        );

        return ticketRepositoryPort.save(ticket, command.eventId(), command.sessionIds());
    }

    @Override
    public Ticket updateTicket(UpdateTicketCommand command) {
        // 1. 티켓 조회
        Ticket ticket = ticketRepositoryPort.findById(command.ticketId())
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + command.ticketId()));

        // 2. 이벤트 소유자 확인
        Event event = eventRepositoryPort.findById(ticket.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다."));
        if (!event.isOwnedBy(command.hostId())) {
            throw new IllegalStateException("티켓 수정 권한이 없습니다.");
        }

        // 3. isAllSessions=false 검증
        if (!command.isAllSessions()) {
            if (command.sessionIds() == null || command.sessionIds().isEmpty()) {
                throw new IllegalArgumentException("개별 세션 티켓은 세션 ID를 최소 1개 이상 지정해야 합니다.");
            }
        }

        // 4. 수정
        ticket.updateDetails(
                command.name(), command.description(),
                command.price(), command.originalPrice(),
                command.maxQuantity(), command.isAllSessions(),
                command.sortOrder(), command.isActive(),
                command.salesStart(), command.salesEnd()
        );

        return ticketRepositoryPort.save(ticket, ticket.getEventId(), command.sessionIds());
    }

    @Override
    public void deleteTicket(Long ticketId, Long hostId) {
        // 1. 티켓 조회
        Ticket ticket = ticketRepositoryPort.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다. ID: " + ticketId));

        // 2. 이벤트 소유자 확인
        Event event = eventRepositoryPort.findById(ticket.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다."));
        if (!event.isOwnedBy(hostId)) {
            throw new IllegalStateException("티켓 삭제 권한이 없습니다.");
        }

        // 3. 판매된 티켓이 있으면 삭제 불가
        if (!ticket.isDeletable()) {
            throw new IllegalStateException("이미 판매된 티켓은 삭제할 수 없습니다. 판매 수량: " + ticket.getSoldCount());
        }

        ticketRepositoryPort.deleteById(ticketId);
    }
}
