package com.venueon.post.adapter.out.persistence.repository;

import com.venueon.post.adapter.out.persistence.entity.PostBookmarkJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostBookmarkJpaRepository extends JpaRepository<PostBookmarkJpaEntity, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    void deleteByPostIdAndUserId(Long postId, Long userId);
    Page<PostBookmarkJpaEntity> findAllByUserId(Long userId, Pageable pageable);
}
