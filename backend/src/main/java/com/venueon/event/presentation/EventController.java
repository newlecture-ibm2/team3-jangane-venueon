package com.venueon.event.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.event.adapter.in.web.dto.EventDetailResponse;
import com.venueon.event.adapter.in.web.dto.EventListResponse;
import com.venueon.event.application.port.in.GetEventListUseCase.EventSearchCondition;
import com.venueon.event.application.port.in.GetSessionUseCase;
import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import com.venueon.event.application.service.EventQueryService;
import com.venueon.event.adapter.in.web.dto.SessionResponse;
import com.venueon.event.domain.model.Event;
import com.venueon.event.domain.model.Session;
import com.venueon.ticket.application.port.in.GetTicketUseCase;
import com.venueon.ticket.domain.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 이벤트 공개 API — 누구나 접근 가능
 * v8: 티켓 벌크 조회 추가 (가격/할인 정보 N+1 방지)
 */
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventQueryService eventQueryService;
    private final GetSessionUseCase getSessionUseCase;
    private final GetTicketUseCase getTicketUseCase;

    /**
     * 이벤트 목록 조회 (검색/필터/페이징)
     * GET /events?keyword=&categoryId=&type=&sort=&page=&size=
     */
    @GetMapping
    public ApiResponse<Page<EventListResponse>> getEventList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isOnline,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        EventSearchCondition condition = new EventSearchCondition(
                keyword, categoryId, type, isOnline, sort
        );

        Pageable pageable = createPageable(page, size, sort);

        Page<Event> eventPage = eventQueryService.getEventList(condition, pageable);

        // 벌크 조회 — N+1 방지
        List<Long> eventIds = eventPage.getContent().stream()
                .map(Event::getId)
                .toList();

        // 세션 벌크 조회
        List<Session> allSessions = getSessionUseCase.getSessionsByEventIds(eventIds);
        Map<Long, List<Session>> sessionsByEventId = allSessions.stream()
                .collect(Collectors.groupingBy(Session::getEventId));

        // 티켓 벌크 조회 (가격/할인 정보)
        List<Ticket> allTickets = getTicketUseCase.getTicketsByEventIds(eventIds);
        Map<Long, List<Ticket>> ticketsByEventId = allTickets.stream()
                .collect(Collectors.groupingBy(Ticket::getEventId));

        Page<EventListResponse> result = eventPage.map(event ->
                EventListResponse.from(
                        event,
                        sessionsByEventId.getOrDefault(event.getId(), List.of()),
                        ticketsByEventId.getOrDefault(event.getId(), List.of())
                )
        );

        return ApiResponse.success(result);
    }

    /**
     * 이벤트 상세 조회 (Host 정보 + 세션 포함)
     * GET /events/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<EventDetailResponse> getEventDetail(@PathVariable Long id) {
        Event event = eventQueryService.getEventById(id);
        HostInfo hostInfo = eventQueryService.getHostInfoByCreatorId(event.getCreatorId());

        List<SessionResponse> sessions = getSessionUseCase.getSessionsByEventId(id)
                .stream()
                .map(SessionResponse::from)
                .collect(Collectors.toList());

        EventDetailResponse response = EventDetailResponse.from(event, hostInfo, sessions);
        return ApiResponse.success(response);
    }

    /**
     * 정렬 조건에 따른 Pageable 생성
     * v6: price 정렬 제거 (가격은 Ticket기반 — 향후 추가)
     */
    private Pageable createPageable(int page, int size, String sort) {
        Sort sortOrder = switch (sort) {
            case "oldest" -> Sort.by("createdAt").ascending();
            default -> Sort.by("createdAt").descending(); // "latest"
        };
        return PageRequest.of(page, size, sortOrder);
    }
}
