package com.venueon.member.application.port.out;

import com.venueon.member.domain.model.Member;
import java.util.Optional;

public interface MemberRepositoryPort {
    Optional<Member> findByCommunityIdAndUserId(Long communityId, Long userId);
    Member save(Member member);
    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);
}
