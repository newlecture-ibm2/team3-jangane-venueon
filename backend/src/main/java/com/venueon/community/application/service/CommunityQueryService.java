package com.venueon.community.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.community.application.port.in.GetCommunityQuery;
import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class CommunityQueryService implements GetCommunityQuery {

    private final CommunityRepositoryPort communityRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Page<CommunityResponse> getPublicCommunities(Pageable pageable) {
        return communityRepositoryPort.findPublicCommunities(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long id) {
        Community community = communityRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + id));
        return toResponse(community);
    }
    
    private CommunityResponse toResponse(Community community) {
        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getThumbnailUrl(),
                community.getMemberCount(),
                community.isPublic(),
                community.getCreatorNickname(),
                community.getCreatedAt()
        );
    }
}
