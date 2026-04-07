package com.venueon.event.application.port.out;

import java.util.Optional;

/**
 * 호스트(주최자) 정보를 조회하기 위한 Port-Out
 * Event 모듈이 User 모듈에 직접 의존하지 않도록 인터페이스로 분리
 */
public interface LoadHostInfoPort {

    Optional<HostInfo> findByUserId(Long userId);

    /**
     * 호스트 정보 Value Object
     */
    record HostInfo(
            Long userId,
            String nickname,
            String profileImg,
            String orgName,
            String orgDescription
    ) {}
}
