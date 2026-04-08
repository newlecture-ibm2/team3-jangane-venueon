package com.venueon.comment.adapter.out.persistence.repository;

import com.venueon.comment.adapter.out.persistence.entity.CommentLikeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeJpaRepository extends JpaRepository<CommentLikeJpaEntity, Long> {
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
    void deleteByCommentIdAndUserId(Long commentId, Long userId);
}
