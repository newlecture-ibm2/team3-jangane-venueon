package com.venueon.member.adapter.out.persistence.repository;

import com.venueon.member.adapter.out.persistence.entity.MemberJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberJpaRepository extends JpaRepository<MemberJpaEntity, Long> {

    List<MemberJpaEntity> findByCommunityId(Long communityId);

    List<MemberJpaEntity> findByUserId(Long userId);

    Optional<MemberJpaEntity> findByCommunityIdAndUserId(Long communityId, Long userId);

    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);
}
