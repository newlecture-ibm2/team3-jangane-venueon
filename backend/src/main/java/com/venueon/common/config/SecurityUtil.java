package com.venueon.common.config;

import com.venueon.user.adapter.in.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 보안 관련 공통 유틸리티
 */
@Component
public class SecurityUtil {

    /**
     * 현재 인증된 사용자 정보를 가져옴
     */
    public static Optional<UserPrincipal> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            return Optional.of((UserPrincipal) authentication.getPrincipal());
        }
        return Optional.empty();
    }

    /**
     * 현재 로그인한 사용자의 ID를 가져옴
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().map(UserPrincipal::getId).orElse(null);
    }

    /**
     * 현재 로그인한 사용자의 이메일을 가져옴
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().map(UserPrincipal::getUsername).orElse(null);
    }

    /**
     * 현재 사용자가 서비스 전체 관리자(ADMIN)인지 확인
     */
    public static boolean isAdmin() {
        return getCurrentUser().map(UserPrincipal::isAdmin).orElse(false);
    }

    /**
     * 현재 사용자가 호스트(HOST)인지 확인
     */
    public static boolean isHost() {
        return getCurrentUser().map(UserPrincipal::isHost).orElse(false);
    }
}
