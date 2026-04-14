package com.venueon.manager.comment.application.service;

import com.venueon.manager.comment.application.port.in.CommentManagerUseCase;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import com.venueon.comment.domain.model.Comment;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.member.application.port.out.MemberRepositoryPort;
import com.venueon.member.domain.model.Member;
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
    private final PostRepositoryPort postRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final MemberRepositoryPort memberRepositoryPort;

    private void validateManagerOrAdmin(Long commentId, String email) {
        User requester = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        if (requester.isAdmin()) return;

        Comment comment = commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        
        Post post = postRepositoryPort.findById(comment.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found for comment: " + commentId));

        boolean isManager = memberRepositoryPort.findByCommunityIdAndUserId(post.getCommunityId(), requester.getId())
                .map(Member::isManager)
                .orElse(false);

        if (!isManager) {
            throw new IllegalArgumentException("Permission denied: only managers or system admins can perform this action.");
        }
    }

    @Override
    public void hideComment(Long commentId, String email) {
        validateManagerOrAdmin(commentId, email);
        Comment comment = commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        comment.hide();
        commentRepositoryPort.save(comment);
    }

    @Override
    public void deleteComment(Long commentId, String email) {
        validateManagerOrAdmin(commentId, email);
        commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        commentRepositoryPort.delete(commentId);
    }
}
