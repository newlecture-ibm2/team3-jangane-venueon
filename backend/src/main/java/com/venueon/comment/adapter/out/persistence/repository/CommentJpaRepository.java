package com.venueon.comment.adapter.out.persistence.repository;

import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentJpaRepository extends JpaRepository<CommentJpaEntity, Long> {

    List<CommentJpaEntity> findByPostIdOrderByCreatedAtAsc(Long postId);

    List<CommentJpaEntity> findByParentId(Long parentId);

    long countByPostId(Long postId);
}
