package com.venueon.admin.community.adapter.in.web.dto.response;

import com.venueon.admin.community.domain.model.ContentStatus;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;

import java.time.LocalDateTime;

/**
 * 어드민 게시글 목록 응답 DTO
 */
public record AdminPostListResponse(
        Long id,
        String title,
        String authorNickname,
        String communityName,
        Long communityId,
        int viewCount,
        int commentCount,
        int likeCount,
        ContentStatus status,
        LocalDateTime createdAt
) {
    public static AdminPostListResponse from(PostJpaEntity entity) {
        ContentStatus status = entity.isHidden() ? ContentStatus.HIDDEN : ContentStatus.ACTIVE;
        return new AdminPostListResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getAuthor().getNickname(),
                entity.getCommunity().getName(),
                entity.getCommunity().getId(),
                entity.getViewCount(),
                entity.getCommentCount(),
                entity.getLikeCount(),
                status,
                entity.getCreatedAt()
        );
    }
}
