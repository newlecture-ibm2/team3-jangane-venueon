package com.venueon.badge.application.port.in;

/**
 * 뱃지 발급 UseCase
 * 사용자의 종료된 이벤트 중 미발급 뱃지를 일괄 발급
 */
public interface IssueBadgesUseCase {

    /** 해당 사용자의 미발급 뱃지를 모두 발급 (Lazy Issuance) */
    int issueNewBadgesForUser(Long userId);
}
