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
import com.venueon.member.application.port.out.MemberRepositoryPort;
import com.venueon.member.domain.model.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
@Transactional
public class CommunityCommandService implements CreateCommunityUseCase, UpdateCommunityUseCase {

    private final CommunityRepositoryPort communityRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final MemberRepositoryPort memberRepositoryPort;

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
        
        // 커뮤니티 생성자를 매니저로 등록
        log.debug("[CommunityCreate] Registering creator as manager: communityId={}, userId={}", saved.getId(), creator.getId());
        Member creatorMember = new Member(null, saved.getId(), creator.getId(), true, null);
        memberRepositoryPort.save(creatorMember);
        
        return new CommunityResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getThumbnailUrl(),
                saved.getMemberCount(),
                saved.isPublic(),
                saved.getCreatorNickname(),
                saved.getCreatedAt(),
                true
        );
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunity(Long id, UpdateCommunityRequest request, String email) {
        User requester = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Community existing = communityRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + id));

        // 권한 체크: 시스템 어드민이거나 해당 커뮤니티의 매니저여야 함
        boolean isManager = memberRepositoryPort.findByCommunityIdAndUserId(id, requester.getId())
                .map(Member::isManager)
                .orElse(false);

        if (!requester.isAdmin() && !isManager) {
            throw new IllegalArgumentException("Permission denied: only managers or system admins can update a community.");
        }

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
                saved.getCreatedAt(),
                true
        );
    }
}
