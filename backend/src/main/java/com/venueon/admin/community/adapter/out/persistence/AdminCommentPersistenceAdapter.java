package com.venueon.admin.community.adapter.out.persistence;

import com.venueon.admin.community.application.port.out.AdminCommentRepositoryPort;
import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;
import com.venueon.comment.adapter.out.persistence.repository.CommentJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * 어드민 댓글 영속성 어댑터 (Out-Adapter)
 * - 기존 CommentJpaRepository 재사용
 */
@Component
@RequiredArgsConstructor
public class AdminCommentPersistenceAdapter implements AdminCommentRepositoryPort {

    private final CommentJpaRepository commentJpaRepository;

    @Override
    public Optional<CommentJpaEntity> findCommentById(Long id) {
        return commentJpaRepository.findById(id);
    }

    @Override
    public List<CommentJpaEntity> findCommentsByPostId(Long postId) {
        return commentJpaRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    @Override
    public CommentJpaEntity saveComment(CommentJpaEntity entity) {
        return commentJpaRepository.save(entity);
    }
}
