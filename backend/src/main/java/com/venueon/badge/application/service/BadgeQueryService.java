package com.venueon.badge.application.service;

import com.venueon.badge.application.port.in.GetMyBadgesUseCase;
import com.venueon.badge.application.port.out.BadgeRepositoryPort;
import com.venueon.badge.domain.model.Badge;
import com.venueon.common.annotation.UseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 뱃지 조회 서비스
 * 조회 시 Lazy Issuance 수행 후 목록 반환
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class BadgeQueryService implements GetMyBadgesUseCase {

    private final BadgeRepositoryPort badgeRepositoryPort;
    private final BadgeIssueService badgeIssueService;

    @Override
    @Transactional
    public List<Badge> getMyBadges(Long userId) {
        // 1. 미발급 뱃지 Lazy Issuance
        int issued = badgeIssueService.issueNewBadgesForUser(userId);
        if (issued > 0) {
            log.debug("마이페이지 뱃지 조회 - {} 개 뱃지 자동 발급 완료", issued);
        }

        // 2. 전체 뱃지 목록 반환
        return badgeRepositoryPort.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Badge> getMyBadgeDetail(Long userId, Long badgeId) {
        return badgeRepositoryPort.findByUserIdAndId(userId, badgeId);
    }
}
