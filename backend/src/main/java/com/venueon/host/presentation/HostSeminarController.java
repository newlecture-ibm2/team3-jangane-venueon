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
 * 호스트 세미나 관리 컨트롤러 (충돌 방지를 위해 HostSeminarController로 명칭 변경)
 */
@Slf4j
@RestController
@RequestMapping("/host/seminars")
@RequiredArgsConstructor
public class HostSeminarController {

    private final GetHostEventsUseCase getHostEventsUseCase;
    private final UserJpaRepository userRepository;

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

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            log.warn("인증 실패: Authentication 객체가 비어있습니다.");
            throw new RuntimeException("인증 정보가 없습니다. 로그인이 필요합니다.");
        }

        String principalName = authentication.getName();
        log.info("📢 데이터 조회 시도 유저 정보: [{}]", principalName);

        // 1. 이메일로 먼저 찾아보고, 2. 없으면 닉네임으로 한 번 더 찾아봄
        return userRepository.findByEmail(principalName)
                .or(() -> userRepository.findByNickname(principalName))
                .map(user -> {
                    log.info("✅ 사용자 확인 성공: ID [{}]", user.getId());
                    return user.getId();
                })
                .orElseThrow(() -> {
                    log.error("❌ 사용자 조회 실패: [{}] DB에 없습니다.", principalName);
                    return new RuntimeException("사용자를 찾을 수 없습니다: " + principalName);
                });
    }
}

