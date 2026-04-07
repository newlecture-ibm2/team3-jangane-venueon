package com.venueon.host.presentation;

import com.venueon.common.dto.ApiResponse;
import com.venueon.host.application.port.in.GetHostEventsUseCase;
import com.venueon.host.dto.HostEventResponse;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
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
 * 호스트 이벤트 관리 컨트롤러 (세미나 목록 및 대시보드 조회용)
 */
@Slf4j
@RestController
@RequestMapping("/host/seminars")
@RequiredArgsConstructor
public class HostSeminarController {

    private final GetHostEventsUseCase getHostEventsUseCase;
    private final UserJpaRepository userRepository;

    /**
     * GET /host/events?status=&page=&size=
     * 호스트 본인의 이벤트 목록 조회 (상태별 필터 + 페이지네이션)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<HostEventResponse>>> getMyEvents(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = extractUserId(authentication);
        log.debug("GET /host/events — hostId={}, status={}, page={}, size={}", hostId, status, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostEvents(hostId, status, pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /host/events/drafts?page=&size=
     * 호스트 본인의 임시저장(DRAFT) 이벤트 목록
     */
    @GetMapping("/drafts")
    public ResponseEntity<ApiResponse<Page<HostEventResponse>>> getMyDraftEvents(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hostId = extractUserId(authentication);
        log.debug("GET /host/events/drafts — hostId={}, page={}, size={}", hostId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostEventResponse> result = getHostEventsUseCase.getHostDraftEvents(hostId, pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Authentication 객체에서 진짜 userId 추출
     */
    private Long extractUserId(Authentication authentication) {
        // [개발용 임시 허용] 로그인 정보가 없으면 ID 5번(NextCode 호스트)으로 고정하여 조회 허용
        if (authentication == null || authentication.getName() == null) {
            log.warn("인증 정보가 없습니다. 테스트용 호스트 ID(5)를 사용합니다.");
            return 5L;
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(UserJpaEntity::getId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));
    }
}
