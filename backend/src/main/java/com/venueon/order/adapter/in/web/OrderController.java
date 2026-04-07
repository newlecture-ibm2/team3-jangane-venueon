package com.venueon.order.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.order.adapter.in.web.dto.MyOrderResponse;
import com.venueon.order.application.port.in.GetMyOrdersUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/users/me")
@RequiredArgsConstructor
public class OrderController {

    private final GetMyOrdersUseCase getMyOrdersUseCase;

    /**
     * GET /v1/users/me/orders?tab=upcoming&page=0&size=8
     *
     * 마이페이지 내 강의(수강) 목록 조회
     *
     * @param tab  탭 필터: "upcoming" (수강 예정) | "enrolled" (수강 중) | "completed" (수강 완료)
     * @param page 페이지 번호 (0-based)
     * @param size 페이지 크기 (기본 8)
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "upcoming") String tab,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        String email = authentication.getName();
        log.debug("내 강의 목록 API 호출: email={}, tab={}, page={}, size={}", email, tab, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<MyOrderResponse> result = getMyOrdersUseCase.getMyOrders(email, tab, pageable);

        // 프론트에서 사용하기 쉬운 구조로 매핑
        Map<String, Object> data = new HashMap<>();
        data.put("content", result.getContent());
        data.put("totalPages", result.getTotalPages());
        data.put("totalElements", result.getTotalElements());
        data.put("currentPage", result.getNumber());
        data.put("size", result.getSize());

        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
