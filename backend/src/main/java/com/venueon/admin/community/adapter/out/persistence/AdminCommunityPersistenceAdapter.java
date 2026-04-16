package com.venueon.admin.community.adapter.out.persistence;

import com.venueon.admin.community.application.port.out.AdminCommunityRepositoryPort;
import org.springframework.stereotype.Component;
import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * 어드민 커뮤니티(게시판) 영속성 어댑터
 */
@Component
@RequiredArgsConstructor
public class AdminCommunityPersistenceAdapter implements AdminCommunityRepositoryPort {

    private final CommunityJpaRepository communityJpaRepository;

    @Override
    public List<CommunityJpaEntity> findAllCommunities() {
        return communityJpaRepository.findAll();
    }
}
