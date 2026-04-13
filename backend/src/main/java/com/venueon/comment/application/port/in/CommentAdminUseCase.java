package com.venueon.comment.application.port.in;

public interface CommentAdminUseCase {
    void hideComment(Long commentId);
    void deleteComment(Long commentId);
}
