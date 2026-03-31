package com.venueon.community.adapter.out.persistence.repository;

import com.venueon.community.adapter.out.persistence.entity.CommunityMemberJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityMemberJpaRepository extends JpaRepository<CommunityMemberJpaEntity, Long> {

    List<CommunityMemberJpaEntity> findByCommunityId(Long communityId);

    List<CommunityMemberJpaEntity> findByUserId(Long userId);

    Optional<CommunityMemberJpaEntity> findByCommunityIdAndUserId(Long communityId, Long userId);

    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);
}
