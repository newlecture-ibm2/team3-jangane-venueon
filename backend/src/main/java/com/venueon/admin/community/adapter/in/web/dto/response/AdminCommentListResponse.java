package com.venueon.admin.community.adapter.in.web.dto.response;

import com.venueon.admin.community.domain.model.ContentStatus;
import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;

import java.time.LocalDateTime;

/**
 * 어드민 댓글 목록 응답 DTO
 */
public record AdminCommentListResponse(
        Long id,
        Long postId,
        String authorNickname,
        Long parentId,
        String content,
        int likeCount,
        ContentStatus status,
        LocalDateTime createdAt
) {
    public static AdminCommentListResponse from(CommentJpaEntity entity) {
        ContentStatus status = entity.isHidden() ? ContentStatus.HIDDEN : ContentStatus.ACTIVE;
        return new AdminCommentListResponse(
                entity.getId(),
                entity.getPost().getId(),
                entity.getAuthor().getNickname(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                entity.getContent(),
                entity.getLikeCount(),
                status,
                entity.getCreatedAt()
        );
    }
}
