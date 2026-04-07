package com.venueon.comment.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.comment.application.port.in.CreateCommentUseCase;
import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.in.dto.CreateCommentRequest;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import com.venueon.comment.domain.model.Comment;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class CommentCommandService implements CreateCommentUseCase {

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
                saved.getCreatedAt()
        );
    }
}
