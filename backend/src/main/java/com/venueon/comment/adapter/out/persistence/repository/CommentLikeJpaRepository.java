package com.venueon.comment.adapter.out.persistence.repository;

import com.venueon.comment.adapter.out.persistence.entity.CommentLikeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeJpaRepository extends JpaRepository<CommentLikeJpaEntity, Long> {
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
    void deleteByCommentIdAndUserId(Long commentId, Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from CommentLikeJpaEntity l where l.comment.id = :commentId")
    void deleteByCommentId(Long commentId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from CommentLikeJpaEntity l where l.comment.post.id = :postId")
    void deleteByPostId(Long postId);
}
