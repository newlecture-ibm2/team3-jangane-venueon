package com.venueon.community.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.community.application.port.in.GetCommunityQuery;
import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.member.application.port.out.MemberRepositoryPort;
import com.venueon.post.application.port.out.PostRepositoryPort;
import lombok.RequiredArgsConstructor;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.badge.application.port.out.BadgeRepositoryPort;
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
    private final CommunityPermissionService communityPermissionService;
    private final PostRepositoryPort postRepositoryPort;
    private final OrderRepositoryPort orderRepositoryPort;
    private final BadgeRepositoryPort badgeRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Page<CommunityResponse> getPublicCommunities(Pageable pageable, String email) {
        return communityRepositoryPort.findPublicCommunities(pageable)
                .map(community -> toResponse(community, email));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommunityResponse> getJoinedCommunities(Pageable pageable, String email) {
        if (email == null || email.isEmpty()) {
            return Page.empty(pageable);
        }
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        
        Long userId = user.getId();

        // 1. 멤버 테이블에서 가입된 커뮤니티 ID들
        java.util.List<Long> memberCommunityIds = memberRepositoryPort.findCommunityIdsByUserId(userId);

        // 2. 유효 주문(PAID, REGISTERED)이 있는 이벤트 ID들
        java.util.List<Long> orderEventIds = orderRepositoryPort.findAllValidOrdersByUserId(userId).stream()
                .map(o -> o.getEventId())
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(java.util.stream.Collectors.toList());

        // 3. 뱃지를 보유한 이벤트 ID들
        java.util.List<Long> badgeEventIds = badgeRepositoryPort.findByUserId(userId).stream()
                .map(b -> b.getEventId())
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(java.util.stream.Collectors.toList());

        // 합집합용 이벤트 ID 리스트
        java.util.Set<Long> allEventIds = new java.util.HashSet<>(orderEventIds);
        allEventIds.addAll(badgeEventIds);

        return communityRepositoryPort.findJoinedCommunities(memberCommunityIds, new java.util.ArrayList<>(allEventIds), pageable)
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
        boolean canWrite = false;
        if (email != null && !email.isEmpty()) {
            User user = userRepositoryPort.findByEmail(email).orElse(null);
            if (user != null) {
                if (user.isAdmin()) {
                    canManage = true;
                } else {
                    canManage = memberRepositoryPort.findByCommunityIdAndUserId(community.getId(), user.getId())
                            .map(member -> member.isManager())
                            .orElse(false);
                }
                canWrite = communityPermissionService.canWrite(community.getId(), user);
            }
        }

        java.time.LocalDateTime lastPostCreatedAt = postRepositoryPort.findLatestPostDateByCommunityId(community.getId());

        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getThumbnailUrl(),
                community.getMemberCount(),
                community.isPublic(),
                community.getCreatorNickname(),
                community.getCreatedAt(),
                lastPostCreatedAt != null ? lastPostCreatedAt : community.getCreatedAt(),
                canManage,
                canWrite,
                community.getType(),
                null,       // eventName
                "일반",      // eventCategory
                "상세 정보 참조" // eventLocation
        );
    }
}
