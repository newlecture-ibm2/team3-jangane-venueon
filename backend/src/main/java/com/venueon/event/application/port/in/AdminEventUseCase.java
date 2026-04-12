package com.venueon.event.application.port.in;

import com.venueon.event.adapter.in.web.dto.EventAdminDetailResponse;
import com.venueon.event.adapter.in.web.dto.EventAdminResponse;
import com.venueon.event.domain.model.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminEventUseCase {
    Page<EventAdminResponse> getEvents(String status, Long categoryId, String keyword, Boolean isHidden, Pageable pageable);
    EventAdminDetailResponse getEventDetail(Long id);
    void toggleVisibility(Long id);
    void deleteEvent(Long id);
}
