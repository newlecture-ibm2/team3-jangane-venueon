package com.venueon.comment.adapter.out.persistence;

import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;
import com.venueon.comment.adapter.out.persistence.repository.CommentJpaRepository;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import com.venueon.comment.domain.model.Comment;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CommentPersistenceAdapter implements CommentRepositoryPort {

    private final CommentJpaRepository commentJpaRepository;
    private final PostJpaRepository postJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public Comment save(Comment comment) {
        PostJpaEntity post = postJpaRepository.findById(comment.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + comment.getPostId()));

        UserJpaEntity author = userJpaRepository.findById(comment.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + comment.getAuthorId()));

        CommentJpaEntity parent = null;
        if (comment.getParentId() != null) {
            parent = commentJpaRepository.findById(comment.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found with id: " + comment.getParentId()));
        }

        CommentJpaEntity entity = CommentJpaEntity.builder()
                .id(comment.getId())
                .post(post)
                .author(author)
                .parent(parent)
                .content(comment.getContent())
                .build();

        CommentJpaEntity saved = commentJpaRepository.save(entity);
        return mapToDomain(saved);
    }

    @Override
    public Optional<Comment> findById(Long id) {
        return commentJpaRepository.findById(id).map(this::mapToDomain);
    }

    @Override
    public List<Comment> findByPostId(Long postId) {
        return commentJpaRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public long countByPostId(Long postId) {
        return commentJpaRepository.countByPostId(postId);
    }

    private Comment mapToDomain(CommentJpaEntity entity) {
        return Comment.builder()
                .id(entity.getId())
                .postId(entity.getPost().getId())
                .authorId(entity.getAuthor().getId())
                .authorNickname(entity.getAuthor().getNickname())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
