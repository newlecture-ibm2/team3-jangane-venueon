package com.venueon.community.adapter.out.persistence;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.community.application.port.out.CommunityRepositoryPort;
import com.venueon.community.domain.model.Community;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CommunityPersistenceAdapter implements CommunityRepositoryPort {

    private final CommunityJpaRepository communityJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final EventJpaRepository eventJpaRepository;

    @Override
    public Community save(Community community) {
        UserJpaEntity creator = userJpaRepository.findById(community.getCreatorId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + community.getCreatorId()));

        EventJpaEntity event = null;
        if (community.getEventId() != null) {
            event = eventJpaRepository.findById(community.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + community.getEventId()));
        }

        CommunityJpaEntity entity = CommunityJpaEntity.builder()
                .id(community.getId())
                .creator(creator)
                .event(event)
                .name(community.getName())
                .description(community.getDescription())
                .isPublic(community.isPublic())
                .thumbnailUrl(community.getThumbnailUrl())
                .memberCount(community.getMemberCount())
                .type(community.getType())
                .build();
                
        // 만약 업데이트라면 ID를 유지
        if (community.getId() != null) {
            // reflection이나 빌더 꼼수를 통해 id 세팅 필요 시 고려 (보통은 save용 DTO와 분리)
        }

        CommunityJpaEntity saved = communityJpaRepository.save(entity);
        return mapToDomain(saved);
    }

    @Override
    public Page<Community> findPublicCommunities(Pageable pageable) {
        return communityJpaRepository.findByIsPublicTrue(pageable)
                .map(this::mapToDomain);
    }

    @Override
    public Page<Community> findByIdIn(java.util.List<Long> ids, Pageable pageable) {
        if (ids == null || ids.isEmpty()) {
            return Page.empty(pageable);
        }
        return communityJpaRepository.findByIdIn(ids, pageable)
                .map(this::mapToDomain);
    }

    @Override
    public Page<Community> findJoinedCommunities(java.util.List<Long> memberCommunityIds, java.util.List<Long> eventIds, Pageable pageable) {
        if ((memberCommunityIds == null || memberCommunityIds.isEmpty()) && (eventIds == null || eventIds.isEmpty())) {
            return Page.empty(pageable);
        }
        
        // NULL 방지 (Query에서 IN 절에 빈 리스트/null 전달 시 오류 우려)
        if (memberCommunityIds == null) memberCommunityIds = new java.util.ArrayList<>();
        if (eventIds == null) eventIds = new java.util.ArrayList<>();
        
        // 만약 둘 다 비어있다면 위에서 걸러짐
        // memberCommunityIds나 eventIds 중 하나가 비어있으면 쿼리 에러가 날 수 있으므로 최소 1개는 더미 데이터를 넣거나 명시적인 처리가 필요함
        // 하지만 findJoinedCommunities 쿼리 특성상 둘 다 필수로 필요할 수 있음
        // 빈 리스트일 때 0L 을 넣어주면 ID 0인 데이터는 없으므로 안전하게 쿼리 가능
        if (memberCommunityIds.isEmpty()) memberCommunityIds = java.util.List.of(0L);
        if (eventIds.isEmpty()) eventIds = java.util.List.of(0L);

        return communityJpaRepository.findJoinedCommunities(memberCommunityIds, eventIds, pageable)
                .map(this::mapToDomain);
    }

    @Override
    public Optional<Community> findById(Long id) {
        return communityJpaRepository.findById(id).map(this::mapToDomain);
    }
    
    private Community mapToDomain(CommunityJpaEntity entity) {
        return Community.builder()
                .id(entity.getId())
                .eventId(entity.getEvent() != null ? entity.getEvent().getId() : null)
                .creatorId(entity.getCreator().getId())
                .creatorNickname(entity.getCreator().getNickname())
                .name(entity.getName())
                .description(entity.getDescription())
                .thumbnailUrl(entity.getThumbnailUrl())
                .memberCount(entity.getMemberCount())
                .isPublic(entity.isPublic())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
