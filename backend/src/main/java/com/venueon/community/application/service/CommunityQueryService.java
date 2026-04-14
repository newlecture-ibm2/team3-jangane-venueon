package com.venueon.community.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.community.application.port.in.GetCommunityQuery;
import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.member.application.port.out.MemberRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class CommunityQueryService implements GetCommunityQuery {

    private final CommunityRepositoryPort communityRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final MemberRepositoryPort memberRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Page<CommunityResponse> getPublicCommunities(Pageable pageable, String email) {
        return communityRepositoryPort.findPublicCommunities(pageable)
                .map(community -> toResponse(community, email));
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long id, String email) {
        Community community = communityRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + id));
        return toResponse(community, email);
    }
    
    private CommunityResponse toResponse(Community community, String email) {
        boolean canManage = false;
        
        // 로깅 강화 (System.out 사용하여 출력 보장)
        System.out.println(">>>> [CommunityAuth] Start check. CommID: " + community.getId() + ", Email: " + email);

        if (email != null && !email.isEmpty()) {
            User user = userRepositoryPort.findByEmail(email).orElse(null);
            if (user != null) {
                System.out.println(">>>> [CommunityAuth] User found: ID=" + user.getId() + ", RoleID=" + (user.getRole() != null ? user.getRole().id() : "null"));
                
                if (user.isAdmin()) {
                    System.out.println(">>>> [CommunityAuth] User is System Admin");
                    canManage = true;
                } else {
                    canManage = memberRepositoryPort.findByCommunityIdAndUserId(community.getId(), user.getId())
                            .map(member -> {
                                System.out.println(">>>> [CommunityAuth] Member entry found. isManager=" + member.isManager());
                                return member.isManager();
                            })
                            .orElseGet(() -> {
                                System.out.println(">>>> [CommunityAuth] No member record found for this user in this community");
                                return false;
                            });
                }
            } else {
                System.out.println(">>>> [CommunityAuth] User NOT FOUND in database for email: " + email);
            }
        } else {
            System.out.println(">>>> [CommunityAuth] Email is NULL or EMPTY");
        }

        System.out.println(">>>> [CommunityAuth] Final Verdict: " + canManage);

        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getThumbnailUrl(),
                community.getMemberCount(),
                community.isPublic(),
                community.getCreatorNickname(),
                community.getCreatedAt(),
                canManage
        );
    }
}
