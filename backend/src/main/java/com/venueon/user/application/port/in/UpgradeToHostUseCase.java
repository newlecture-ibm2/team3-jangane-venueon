package com.venueon.user.application.port.in;

import com.venueon.user.domain.model.User;

/**
 * 인증된 일반 사용자(USER) → 호스트(HOST)로 업그레이드
 * 구글 소셜 로그인 후 호스트 가입 2단계에서 사용
 */
public interface UpgradeToHostUseCase {
    User upgradeToHost(String email, String managerName,
                       String orgName, String orgNumber, String orgDescription);
}
