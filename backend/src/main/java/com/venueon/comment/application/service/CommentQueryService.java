package com.venueon.comment.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.comment.application.port.in.GetCommentQuery;
import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@UseCase
@RequiredArgsConstructor
public class CommentQueryService implements GetCommentQuery {

    private final CommentRepositoryPort commentRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        return commentRepositoryPort.findByPostId(postId)
                .stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getPostId(),
                        comment.getAuthorId(),
                        comment.getAuthorNickname(),
                        comment.getContent(),
                        comment.getParentId(),
                        comment.getLikeCount(),
                        comment.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
