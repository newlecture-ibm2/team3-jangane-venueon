package com.venueon.event.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.event.adapter.in.web.dto.EventDetailResponse;
import com.venueon.event.adapter.in.web.dto.EventListResponse;
import com.venueon.event.application.port.in.GetEventDetailUseCase;
import com.venueon.event.application.port.in.GetEventListUseCase;
import com.venueon.event.application.port.in.GetEventListUseCase.EventSearchCondition;
import com.venueon.event.domain.model.EventType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

/**
 * 이벤트 공개 API — 누구나 접근 가능
 */
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final GetEventListUseCase getEventListUseCase;
    private final GetEventDetailUseCase getEventDetailUseCase;

    /**
     * 이벤트 목록 조회 (검색/필터/페이징)
     * GET /events?keyword=&categoryId=&type=&isOnline=&isFree=&minPrice=&maxPrice=&sort=&page=&size=
     */
    @GetMapping
    public ApiResponse<Page<EventListResponse>> getEventList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) Boolean isOnline,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        EventSearchCondition condition = new EventSearchCondition(
                keyword, categoryId, type, isOnline, isFree, minPrice, maxPrice, sort
        );

        Pageable pageable = createPageable(page, size, sort);

        Page<EventListResponse> result = getEventListUseCase
                .getEventList(condition, pageable)
                .map(EventListResponse::from);

        return ApiResponse.success(result);
    }

    /**
     * 이벤트 상세 조회
     * GET /events/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<EventDetailResponse> getEventDetail(@PathVariable Long id) {
        EventDetailResponse response = EventDetailResponse.from(
                getEventDetailUseCase.getEventById(id)
        );
        return ApiResponse.success(response);
    }

    /**
     * 정렬 조건에 따른 Pageable 생성
     */
    private Pageable createPageable(int page, int size, String sort) {
        Sort sortOrder = switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "oldest" -> Sort.by("createdAt").ascending();
            default -> Sort.by("createdAt").descending(); // "latest"
        };
        return PageRequest.of(page, size, sortOrder);
    }
}
