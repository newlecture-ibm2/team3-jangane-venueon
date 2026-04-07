package com.venueon.host.presentation;

import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * 호스트 컨트롤러 공통 — Authentication에서 userId(hostId) 추출
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HostAuthSupport {

    private final UserJpaRepository userRepository;

    public Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            log.warn("인증 실패: Authentication 객체가 비어있습니다.");
            throw new RuntimeException("인증 정보가 없습니다. 로그인이 필요합니다.");
        }

        String principalName = authentication.getName();
        return userRepository.findByEmail(principalName)
                .or(() -> userRepository.findByNickname(principalName))
                .map(user -> {
                    log.debug("사용자 확인: ID [{}]", user.getId());
                    return user.getId();
                })
                .orElseThrow(() -> {
                    log.error("사용자 조회 실패: [{}]", principalName);
                    return new RuntimeException("사용자를 찾을 수 없습니다: " + principalName);
                });
    }
}
