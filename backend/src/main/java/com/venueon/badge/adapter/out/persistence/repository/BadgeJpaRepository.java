package com.venueon.badge.adapter.out.persistence.repository;

import com.venueon.badge.adapter.out.persistence.entity.BadgeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BadgeJpaRepository extends JpaRepository<BadgeJpaEntity, Long> {

    List<BadgeJpaEntity> findByUserIdOrderByEarnedAtDesc(Long userId);

    Optional<BadgeJpaEntity> findByUserIdAndId(Long userId, Long id);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    List<BadgeJpaEntity> findByUserIdAndEventIdIn(Long userId, List<Long> eventIds);
}
