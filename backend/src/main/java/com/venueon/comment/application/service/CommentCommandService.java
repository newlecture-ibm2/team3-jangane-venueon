package com.venueon.comment.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.comment.application.port.in.CommentLikeUseCase;
import com.venueon.comment.application.port.in.CreateCommentUseCase;
import com.venueon.comment.application.port.in.DeleteCommentUseCase;
import com.venueon.comment.application.port.in.UpdateCommentUseCase;
import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.in.dto.CreateCommentRequest;
import com.venueon.comment.application.port.in.dto.UpdateCommentRequest;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import com.venueon.comment.domain.model.Comment;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
@Transactional
public class CommentCommandService implements CreateCommentUseCase, CommentLikeUseCase, UpdateCommentUseCase, DeleteCommentUseCase {

    private final CommentRepositoryPort commentRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, String email) {
        User author = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Comment comment = Comment.builder()
                .postId(request.postId())
                .authorId(author.getId())
                .parentId(request.parentId())
                .content(request.content())
                .build();

        Comment saved = commentRepositoryPort.save(comment);

        return new CommentResponse(
                saved.getId(),
                saved.getPostId(),
                saved.getAuthorId(),
                saved.getAuthorNickname(),
                saved.getContent(),
                saved.getParentId(),
                saved.getLikeCount(),
                saved.getCreatedAt()
        );
    }

    @Override
    public void toggleLike(Long commentId, String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        
        Comment comment = commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + commentId));

        if (commentRepositoryPort.existsLike(commentId, user.getId())) {
            commentRepositoryPort.deleteLike(commentId, user.getId());
            comment.decrementLikeCount();
        } else {
            commentRepositoryPort.saveLike(commentId, user.getId());
            comment.incrementLikeCount();
        }

        commentRepositoryPort.save(comment);
    }

    @Override
    public void updateComment(Long id, UpdateCommentRequest request) {
        Comment comment = commentRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));
        
        comment.update(request.content());
        commentRepositoryPort.save(comment);
    }

    @Override
    public void deleteComment(Long id) {
        commentRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));
        
        commentRepositoryPort.delete(id);
    }
}
