package com.venueon.admin.event.application.port.in;

import com.venueon.admin.event.adapter.in.web.dto.EventAdminDetailResponse;
import com.venueon.admin.event.adapter.in.web.dto.EventAdminResponse;
import com.venueon.admin.event.adapter.in.web.dto.UpdateEventRequest;
import com.venueon.admin.event.adapter.in.web.dto.UpdateSessionRequest;
import com.venueon.admin.event.adapter.in.web.dto.UpdateTicketRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminEventUseCase {
    Page<EventAdminResponse> getEvents(String status, Long categoryId, String keyword, Boolean isHidden, Pageable pageable);
    EventAdminDetailResponse getEventDetail(Long id);
    void updateEvent(Long id, UpdateEventRequest request);
    void updateSession(Long eventId, Long sessionId, UpdateSessionRequest request);
    void updateTicket(Long eventId, Long ticketId, UpdateTicketRequest request);
    void toggleVisibility(Long id);
    void deleteEvent(Long id);
}
