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
