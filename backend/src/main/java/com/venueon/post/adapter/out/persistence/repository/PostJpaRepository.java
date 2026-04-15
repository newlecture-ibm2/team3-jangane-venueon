package com.venueon.post.adapter.out.persistence.repository;

import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.domain.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostJpaRepository extends JpaRepository<PostJpaEntity, Long> {

    Page<PostJpaEntity> findByCommunityIdOrderByIsNoticeDescIsPinnedDescCreatedAtDesc(Long communityId, Pageable pageable);

    Page<PostJpaEntity> findByCommunityIdAndTypeOrderByIsNoticeDescIsPinnedDescCreatedAtDesc(Long communityId, PostType type, Pageable pageable);

    Page<PostJpaEntity> findByAuthorId(Long authorId, Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM PostJpaEntity p " +
            "WHERE p.community.id = :communityId " +
            "AND (:type IS NULL OR p.type = :type) " +
            "AND (p.title LIKE CONCAT('%', :keyword, '%') " +
            "OR p.content LIKE CONCAT('%', :keyword, '%') " +
            "OR p.author.nickname LIKE CONCAT('%', :keyword, '%')) " +
            "ORDER BY p.isNotice DESC, p.isPinned DESC, p.createdAt DESC")
    Page<PostJpaEntity> searchByKeyword(
            @org.springframework.data.repository.query.Param("communityId") Long communityId,
            @org.springframework.data.repository.query.Param("type") com.venueon.post.domain.model.PostType type,
            @org.springframework.data.repository.query.Param("keyword") String keyword,
            Pageable pageable);
}
