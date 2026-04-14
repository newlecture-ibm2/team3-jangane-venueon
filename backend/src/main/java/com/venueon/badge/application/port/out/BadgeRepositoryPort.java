package com.venueon.badge.application.port.out;

import com.venueon.badge.domain.model.Badge;

import java.util.List;
import java.util.Optional;

/**
 * Badge 저장/조회 Port (Out)
 */
public interface BadgeRepositoryPort {

    Badge save(Badge badge);

    List<Badge> findByUserId(Long userId);

    Optional<Badge> findByUserIdAndId(Long userId, Long badgeId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    /** 사용자의 뱃지 중 주어진 eventId 목록에 해당하는 것만 조회 (중복 체크용) */
    List<Badge> findByUserIdAndEventIdIn(Long userId, List<Long> eventIds);
}
