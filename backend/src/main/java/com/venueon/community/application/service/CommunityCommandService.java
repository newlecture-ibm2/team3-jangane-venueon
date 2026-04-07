package com.venueon.community.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.community.application.port.in.CreateCommunityUseCase;
import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.in.dto.CreateCommunityRequest;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class CommunityCommandService implements CreateCommunityUseCase {

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
}
