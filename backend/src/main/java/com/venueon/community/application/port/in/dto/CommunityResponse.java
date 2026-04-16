package com.venueon.community.application.port.in.dto;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;

import java.time.LocalDateTime;

public record CommunityResponse(
        Long id,
        String name,
        String description,
        String thumbnailUrl,
        int memberCount,
        boolean isPublic,
        String creatorNickname,
        LocalDateTime createdAt,
        LocalDateTime lastPostCreatedAt,
        boolean canManage, // 관리 권한 여부
        boolean canWrite,   // 글쓰기 권한 여부
        com.venueon.community.domain.model.CommunityType type,
        String eventName,
        String eventCategory,
        String eventLocation
) {
    public static CommunityResponse from(CommunityJpaEntity entity) {
        return from(entity, null);
    }

    public static CommunityResponse from(CommunityJpaEntity entity, LocalDateTime lastPostCreatedAt) {
        String eventTitle = entity.getEvent() != null ? entity.getEvent().getTitle() : null;
        String categoryName = (entity.getEvent() != null && entity.getEvent().getCategory() != null) 
                                ? entity.getEvent().getCategory().getName() : "일반";
        String location = "상세 정보 참조"; // Event에서 location이 제거됨

        return new CommunityResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getThumbnailUrl(),
                entity.getMemberCount(),
                entity.isPublic(),
                entity.getCreator().getNickname(),
                entity.getCreatedAt(),
                lastPostCreatedAt != null ? lastPostCreatedAt : entity.getCreatedAt(),
                false, // canManage 기본값
                true,   // canWrite 기본값
                entity.getType(),
                eventTitle,
                categoryName, // eventCategory 필드로 사용
                location
        );
    }
}
