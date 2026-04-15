package com.venueon.admin.community.application.port.out;

import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 어드민 커뮤니티 게시글 영속성 Port (Outbound Port)
 * - 기존 PostJpaEntity를 재사용하여 어드민 전용 쿼리 제공
 */
public interface AdminPostRepositoryPort {

    /**
     * 게시글 ID로 조회
     */
    Optional<PostJpaEntity> findPostById(Long id);

    /**
     * 게시글 목록 동적 조회 (키워드, 커뮤니티, 숨김 여부 필터)
     */
    Page<PostJpaEntity> findPosts(String keyword, Long communityId, Boolean hidden, Pageable pageable);

    /**
     * 게시글 저장 (상태 변경 반영)
     */
    PostJpaEntity savePost(PostJpaEntity entity);

    /**
     * 게시글 삭제 (물리 삭제 — DELETED 상태 전환 후 최종 정리용)
     */
    void deletePost(Long id);
}
