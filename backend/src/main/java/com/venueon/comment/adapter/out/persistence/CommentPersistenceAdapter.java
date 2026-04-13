package com.venueon.comment.adapter.out.persistence;

import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;
import com.venueon.comment.adapter.out.persistence.entity.CommentLikeJpaEntity;
import com.venueon.comment.adapter.out.persistence.repository.CommentJpaRepository;
import com.venueon.comment.adapter.out.persistence.repository.CommentLikeJpaRepository;
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
    private final CommentLikeJpaRepository commentLikeJpaRepository;
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
                .likeCount(comment.getLikeCount())
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

    @Override
    public boolean existsLike(Long commentId, Long userId) {
        return commentLikeJpaRepository.existsByCommentIdAndUserId(commentId, userId);
    }

    @Override
    public void saveLike(Long commentId, Long userId) {
        CommentJpaEntity comment = commentJpaRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        UserJpaEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        CommentLikeJpaEntity like = CommentLikeJpaEntity.builder()
                .comment(comment)
                .user(user)
                .build();
        commentLikeJpaRepository.save(like);
    }

    @Override
    public void deleteLike(Long commentId, Long userId) {
        commentLikeJpaRepository.deleteByCommentIdAndUserId(commentId, userId);
    }

    @Override
    public boolean existsById(Long id) {
        return commentJpaRepository.existsById(id);
    }

    @Override
    public void deleteById(Long id) {
        commentJpaRepository.deleteById(id);
    }

    private Comment mapToDomain(CommentJpaEntity entity) {
        return Comment.builder()
                .id(entity.getId())
                .postId(entity.getPost().getId())
                .authorId(entity.getAuthor().getId())
                .authorNickname(entity.getAuthor().getNickname())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .content(entity.getContent())
                .likeCount(entity.getLikeCount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
