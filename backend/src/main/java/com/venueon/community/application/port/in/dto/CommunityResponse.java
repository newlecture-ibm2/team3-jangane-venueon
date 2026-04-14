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
        boolean canManage // 관리 권한 여부
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
                false // 기본값
        );
    }
}
