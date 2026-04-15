package com.venueon.admin.community.application.port.out;

import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;

import java.util.List;
import java.util.Optional;

/**
 * 어드민 커뮤니티 댓글 영속성 Port (Outbound Port)
 * - 기존 CommentJpaEntity를 재사용하여 어드민 전용 쿼리 제공
 */
public interface AdminCommentRepositoryPort {

    /**
     * 댓글 ID로 조회
     */
    Optional<CommentJpaEntity> findCommentById(Long id);

    /**
     * 특정 게시글의 댓글 목록 조회
     */
    List<CommentJpaEntity> findCommentsByPostId(Long postId);

    /**
     * 댓글 저장 (상태 변경 반영)
     */
    CommentJpaEntity saveComment(CommentJpaEntity entity);
}
