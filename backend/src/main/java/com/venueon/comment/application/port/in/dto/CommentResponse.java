package com.venueon.comment.application.port.in.dto;

import java.time.LocalDateTime;

/**
 * 댓글 응답 DTO
 */
public record CommentResponse(
    Long id,
    Long postId,
    Long authorId,
    String authorNickname,
    String content,
    Long parentId,
    int likeCount,
    LocalDateTime createdAt
) {
}
