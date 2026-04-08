package com.venueon.host.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.host.application.port.in.GetHostEventsUseCase;
import com.venueon.host.dto.HostEventResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 호스트 세미나 관리 컨트롤러 (충돌 방지를 위해 HostSeminarController로 명칭 변경)
 */
@Slf4j
@RestController
@RequestMapping("/host/events")
@RequiredArgsConstructor
public class HostSeminarController {

    private final GetHostEventsUseCase getHostEventsUseCase;
    private final HostAuthSupport hostAuthSupport;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HostEventResponse>>> getMyEvents(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/events — hostId={}, status={}, page={}, size={}", hostId, status, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostEvents(hostId, status, pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/drafts")
    public ResponseEntity<ApiResponse<Page<HostEventResponse>>> getMyDraftEvents(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = hostAuthSupport.extractUserId(authentication);
        log.debug("GET /host/events/drafts — hostId={}, page={}, size={}", hostId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostDraftEvents(hostId, pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

}

