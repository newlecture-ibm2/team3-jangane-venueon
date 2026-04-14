package com.venueon.manager.comment.application.port.in;

/**
 * 커뮤니티 매니저 전용 댓글 관리 UseCase.
 * 커뮤니티 내 관리 권한을 가진 매니저가 사용합니다.
 */
public interface CommentManagerUseCase {
    void hideComment(Long commentId);
    void deleteComment(Long commentId);
}
