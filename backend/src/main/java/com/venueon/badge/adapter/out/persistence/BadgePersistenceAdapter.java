package com.venueon.badge.adapter.out.persistence;

import com.venueon.badge.adapter.out.persistence.entity.BadgeJpaEntity;
import com.venueon.badge.adapter.out.persistence.repository.BadgeJpaRepository;
import com.venueon.badge.application.port.out.BadgeRepositoryPort;
import com.venueon.badge.domain.model.Badge;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BadgePersistenceAdapter implements BadgeRepositoryPort {

    private final BadgeJpaRepository badgeJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final EventJpaRepository eventJpaRepository;

    @Override
    public Badge save(Badge badge) {
        UserJpaEntity user = userJpaRepository.findById(badge.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        EventJpaEntity event = null;
        if (badge.getEventId() != null) {
            event = eventJpaRepository.findById(badge.getEventId()).orElse(null);
        }

        BadgeJpaEntity entity = BadgeJpaEntity.builder()
                .user(user)
                .event(event)
                .badgeName(badge.getBadgeName())
                .badgeImageUrl(badge.getBadgeImageUrl())
                .isVisible(badge.isVisible())
                .earnedAt(badge.getEarnedAt())
                .build();

        BadgeJpaEntity saved = badgeJpaRepository.save(entity);
        return BadgeMapper.toDomain(saved);
    }

    @Override
    public List<Badge> findByUserId(Long userId) {
        return badgeJpaRepository.findByUserIdOrderByEarnedAtDesc(userId)
                .stream()
                .map(BadgeMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Badge> findByUserIdAndId(Long userId, Long badgeId) {
        return badgeJpaRepository.findByUserIdAndId(userId, badgeId)
                .map(BadgeMapper::toDomain);
    }

    @Override
    public boolean existsByUserIdAndEventId(Long userId, Long eventId) {
        return badgeJpaRepository.existsByUserIdAndEventId(userId, eventId);
    }

    @Override
    public List<Badge> findByUserIdAndEventIdIn(Long userId, List<Long> eventIds) {
        return badgeJpaRepository.findByUserIdAndEventIdIn(userId, eventIds)
                .stream()
                .map(BadgeMapper::toDomain)
                .collect(Collectors.toList());
    }
}
