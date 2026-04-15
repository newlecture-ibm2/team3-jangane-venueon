package com.venueon.community.adapter.out.persistence.repository;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityJpaRepository extends JpaRepository<CommunityJpaEntity, Long> {

    Optional<CommunityJpaEntity> findByEventId(Long eventId);

    Page<CommunityJpaEntity> findByIsPublicTrue(Pageable pageable);

    List<CommunityJpaEntity> findByCreatorId(Long creatorId);
    Page<CommunityJpaEntity> findByIdIn(List<Long> ids, Pageable pageable);
}
