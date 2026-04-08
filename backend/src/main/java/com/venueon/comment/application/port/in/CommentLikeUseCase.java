package com.venueon.comment.application.port.in;

public interface CommentLikeUseCase {
    void toggleLike(Long commentId, String email);
}
