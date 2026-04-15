package com.venueon.community.application.service;

import com.venueon.badge.application.port.out.BadgeRepositoryPort;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import com.venueon.community.domain.model.CommunityType;
import com.venueon.member.application.port.out.MemberRepositoryPort;
import com.venueon.member.domain.model.Member;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityPermissionService {

    private final CommunityRepositoryPort communityRepositoryPort;
    private final MemberRepositoryPort memberRepositoryPort;
    private final OrderRepositoryPort orderRepositoryPort;
    private final BadgeRepositoryPort badgeRepositoryPort;

    public boolean canWrite(Long communityId, User user) {
        if (user == null) return false;
        if (user.isAdmin()) return true;

        Community community = communityRepositoryPort.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found: " + communityId));

        // 매니저인지 확인
        boolean isManager = memberRepositoryPort.findByCommunityIdAndUserId(communityId, user.getId())
                .map(Member::isManager)
                .orElse(false);
        if (isManager) return true;

        // 타입별 권한 체크
        if (community.getType() == CommunityType.HOST_AUTO) {
            // 이벤트 구매 내역 확인 (PAID 또는 REGISTERED 상태)
            return community.getEventId() != null && 
                   orderRepositoryPort.existsByUserIdAndEventIdAndStatusIn(
                           user.getId(), 
                           community.getEventId(), 
                           List.of(OrderStatus.PAID, OrderStatus.REGISTERED)
                   );
        } else if (community.getType() == CommunityType.BADGE_CREATED) {
            // 뱃지 보유 여부 확인
            return community.getEventId() != null && 
                   badgeRepositoryPort.existsByUserIdAndEventId(user.getId(), community.getEventId());
        }

        return false;
    }
}
