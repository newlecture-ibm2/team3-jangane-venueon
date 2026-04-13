package com.venueon.host.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.host.application.port.in.GetHostRecentOrdersUseCase;
import com.venueon.host.dto.HostAttendeeResponse;
import com.venueon.host.dto.HostOrderDetailResponse;
import com.venueon.host.dto.HostRecentOrderResponse;
import com.venueon.host.dto.HostOrderSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/host/orders")
@RequiredArgsConstructor
public class HostOrderController {

    private final GetHostRecentOrdersUseCase getHostRecentOrdersUseCase;
    private final HostAuthSupport hostAuthSupport;

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<HostRecentOrderResponse>>> getRecentOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "5") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/orders/recent — hostId={}, size={}", hostId, size);

        List<HostRecentOrderResponse> result = getHostRecentOrdersUseCase.getRecentOrders(hostId, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HostRecentOrderResponse>>> getAllOrders(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/orders — hostId={}, status={}, eventId={}, page={}, size={}", hostId, status, eventId, page, size);

        Page<HostRecentOrderResponse> result = getHostRecentOrdersUseCase.getAllOrders(
                hostId,
                status,
                eventId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderedAt"))
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<HostOrderDetailResponse>> getOrderDetail(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/orders/{} — hostId={}", orderId, hostId);

        HostOrderDetailResponse result = getHostRecentOrdersUseCase.getOrderDetail(hostId, orderId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<HostOrderSummaryResponse>> getOrderSummary(Authentication authentication) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        int currentMonthRevenue = getHostRecentOrdersUseCase.getCurrentMonthRevenue(hostId);
        long totalAttendees = getHostRecentOrdersUseCase.getTotalAttendees(hostId);

        return ResponseEntity.ok(ApiResponse.success(new HostOrderSummaryResponse(currentMonthRevenue, totalAttendees)));
    }

    @GetMapping("/attendees")
    public ResponseEntity<ApiResponse<Page<HostAttendeeResponse>>> getAttendees(
            Authentication authentication,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/orders/attendees — hostId={}, eventId={}, name={}, page={}, size={}", hostId, eventId, name, page, size);

        Page<HostAttendeeResponse> result = getHostRecentOrdersUseCase.getAttendees(
                hostId,
                eventId,
                name,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderedAt"))
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
