package com.venueon.post.adapter.out.persistence.repository;

import com.venueon.post.adapter.out.persistence.entity.PostLikeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeJpaRepository extends JpaRepository<PostLikeJpaEntity, Long> {
    Optional<PostLikeJpaEntity> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostIdAndUserId(Long postId, Long userId);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from PostLikeJpaEntity l where l.post.id = :postId")
    void deleteByPostId(Long postId);
}
