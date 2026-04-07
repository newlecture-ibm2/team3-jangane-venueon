package com.venueon.comment.application.port.in;

import com.venueon.comment.application.port.in.dto.CommentResponse;
import java.util.List;

/**
 * 댓글 조회 쿼리 (Inbound Port)
 */
public interface GetCommentQuery {
    List<CommentResponse> getCommentsByPostId(Long postId);
}
