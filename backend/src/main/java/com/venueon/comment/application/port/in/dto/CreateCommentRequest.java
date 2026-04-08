package com.venueon.comment.application.port.in.dto;

/**
 * 댓글 등록 요청 DTO
 */
public record CreateCommentRequest(
    Long postId,
    String content,
    Long parentId // null이면 일반 댓글, 값이 있으면 대댓글
) {
}
