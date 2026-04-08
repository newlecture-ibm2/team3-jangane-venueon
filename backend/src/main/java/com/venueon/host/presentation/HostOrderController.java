package com.venueon.host.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.host.application.port.in.GetHostRecentOrdersUseCase;
import com.venueon.host.dto.HostRecentOrderResponse;
import com.venueon.host.dto.HostOrderSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<HostOrderSummaryResponse>> getOrderSummary(Authentication authentication) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        int currentMonthRevenue = getHostRecentOrdersUseCase.getCurrentMonthRevenue(hostId);

        return ResponseEntity.ok(ApiResponse.success(new HostOrderSummaryResponse(currentMonthRevenue)));
    }
}
