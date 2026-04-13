package com.venueon.admin.event.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.admin.event.application.port.in.AdminEventUseCase;
import com.venueon.admin.event.adapter.in.web.dto.EventAdminDetailResponse;
import com.venueon.admin.event.adapter.in.web.dto.EventAdminResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final AdminEventUseCase adminEventUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventAdminResponse>>> getEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isHidden,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(ApiResponse.success(adminEventUseCase.getEvents(status, categoryId, keyword, isHidden, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventAdminDetailResponse>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminEventUseCase.getEventDetail(id)));
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<ApiResponse<Void>> toggleVisibility(@PathVariable Long id) {
        adminEventUseCase.toggleVisibility(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        adminEventUseCase.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
