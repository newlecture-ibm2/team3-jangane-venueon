package com.venueon.badge.application.port.in;

import com.venueon.badge.domain.model.Badge;

import java.util.List;
import java.util.Optional;

/**
 * 내 뱃지 조회 UseCase
 * 조회 시 미발급 뱃지를 Lazy로 발급 후 반환
 */
public interface GetMyBadgesUseCase {

    List<Badge> getMyBadges(Long userId);

    Optional<Badge> getMyBadgeDetail(Long userId, Long badgeId);
}
