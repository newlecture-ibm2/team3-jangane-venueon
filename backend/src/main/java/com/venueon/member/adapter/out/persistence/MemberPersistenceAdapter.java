package com.venueon.member.adapter.out.persistence;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.member.adapter.out.persistence.entity.MemberJpaEntity;
import com.venueon.member.adapter.out.persistence.repository.MemberJpaRepository;
import com.venueon.member.application.port.out.MemberRepositoryPort;
import com.venueon.member.domain.model.Member;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MemberPersistenceAdapter implements MemberRepositoryPort {

    private final MemberJpaRepository memberJpaRepository;
    private final CommunityJpaRepository communityJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public Optional<Member> findByCommunityIdAndUserId(Long communityId, Long userId) {
        return memberJpaRepository.findByCommunityIdAndUserId(communityId, userId)
                .map(this::mapToDomain);
    }

    @Override
    public Member save(Member member) {
        CommunityJpaEntity community = communityJpaRepository.findById(member.getCommunityId())
                .orElseThrow(() -> new IllegalArgumentException("Community not found: " + member.getCommunityId()));
        UserJpaEntity user = userJpaRepository.findById(member.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + member.getUserId()));

        MemberJpaEntity entity = MemberJpaEntity.builder()
                .id(member.getId())
                .community(community)
                .user(user)
                .manager(member.isManager()) // boolean 매핑
                .joinedAt(member.getJoinedAt())
                .build();

        return mapToDomain(memberJpaRepository.save(entity));
    }

    @Override
    public boolean existsByCommunityIdAndUserId(Long communityId, Long userId) {
        return memberJpaRepository.existsByCommunityIdAndUserId(communityId, userId);
    }

    @Override
    public java.util.List<Long> findCommunityIdsByUserId(Long userId) {
        return memberJpaRepository.findByUserId(userId).stream()
                .map(m -> m.getCommunity().getId())
                .collect(java.util.stream.Collectors.toList());
    }

    private Member mapToDomain(MemberJpaEntity entity) {
        return new Member(
                entity.getId(),
                entity.getCommunity().getId(),
                entity.getUser().getId(),
                entity.isManager(), // boolean 매핑
                entity.getJoinedAt()
        );
    }
}
