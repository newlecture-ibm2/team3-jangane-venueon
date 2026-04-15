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
        boolean canManage, // 관리 권한 여부
        boolean canWrite,   // 글쓰기 권한 여부
        com.venueon.community.domain.model.CommunityType type
) {
    public static CommunityResponse from(CommunityJpaEntity entity) {
        return new CommunityResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getThumbnailUrl(),
                entity.getMemberCount(),
                entity.isPublic(),
                entity.getCreator().getNickname(),
                entity.getCreatedAt(),
                false, // canManage 기본값
                true,   // canWrite 기본값
                entity.getType()
        );
    }
}
