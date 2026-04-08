package com.venueon.comment.application.port.in;

import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.in.dto.CreateCommentRequest;

/**
 * 댓글 등록 유스케이스 (Inbound Port)
 */
public interface CreateCommentUseCase {
    CommentResponse createComment(CreateCommentRequest request, String email);
}
