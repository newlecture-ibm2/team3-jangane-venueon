package com.venueon.post.adapter.out.persistence.repository;

import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.domain.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostJpaRepository extends JpaRepository<PostJpaEntity, Long> {

    Page<PostJpaEntity> findByCommunityIdOrderByIsPinnedDescCreatedAtDesc(Long communityId, Pageable pageable);

    Page<PostJpaEntity> findByCommunityIdAndTypeOrderByIsPinnedDescCreatedAtDesc(Long communityId, PostType type, Pageable pageable);

    Page<PostJpaEntity> findByAuthorId(Long authorId, Pageable pageable);
}
