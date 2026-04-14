package com.venueon.manager.comment.application.service;

import com.venueon.manager.comment.application.port.in.CommentManagerUseCase;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import com.venueon.comment.domain.model.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manager Actor 전용 Comment 관리 Service.
 * 커뮤니티 매니저가 해당 커뮤니티 내 댓글을 관리합니다.
 * Core 도메인의 CommentRepositoryPort를 주입받아 사용합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ManagerCommentService implements CommentManagerUseCase {

    private final CommentRepositoryPort commentRepositoryPort;

    @Override
    public void hideComment(Long commentId) {
        Comment comment = commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        comment.hide();
        commentRepositoryPort.save(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        commentRepositoryPort.delete(commentId);
    }
}
