package com.venueon.community.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.community.application.port.in.CreateCommunityUseCase;
import com.venueon.community.application.port.in.UpdateCommunityUseCase;
import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.in.dto.CreateCommunityRequest;
import com.venueon.community.application.port.in.dto.UpdateCommunityRequest;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class CommunityCommandService implements CreateCommunityUseCase, UpdateCommunityUseCase {

    private final CommunityRepositoryPort communityRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional
    public CommunityResponse createCommunity(CreateCommunityRequest request, String email) {
        User creator = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Community community = Community.builder()
                .creatorId(creator.getId())
                .creatorNickname(creator.getNickname())
                .eventId(request.eventId())
                .name(request.name())
                .description(request.description())
                .isPublic(request.isPublic() != null ? request.isPublic() : true)
                .build();

        Community saved = communityRepositoryPort.save(community);
        
        return new CommunityResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getThumbnailUrl(),
                saved.getMemberCount(),
                saved.isPublic(),
                saved.getCreatorNickname(),
                saved.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunity(Long id, UpdateCommunityRequest request) {
        Community existing = communityRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + id));

        // 권한 체크는 생략 (나중에 한꺼번에 작업하기로 함)

        Community updated = Community.builder()
                .id(existing.getId())
                .eventId(existing.getEventId())
                .creatorId(existing.getCreatorId())
                .creatorNickname(existing.getCreatorNickname())
                .name(request.name() != null ? request.name() : existing.getName())
                .description(request.description() != null ? request.description() : existing.getDescription())
                .thumbnailUrl(existing.getThumbnailUrl())
                .memberCount(existing.getMemberCount())
                .isPublic(request.isPublic() != null ? request.isPublic() : existing.isPublic())
                .createdAt(existing.getCreatedAt())
                .build();

        Community saved = communityRepositoryPort.save(updated);

        return new CommunityResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getThumbnailUrl(),
                saved.getMemberCount(),
                saved.isPublic(),
                saved.getCreatorNickname(),
                saved.getCreatedAt()
        );
    }
}
