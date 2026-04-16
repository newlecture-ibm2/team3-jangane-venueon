package com.venueon.admin.community.adapter.out.persistence;

import com.venueon.admin.community.application.port.out.AdminPostRepositoryPort;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.post.adapter.out.persistence.repository.PostLikeJpaRepository;
import com.venueon.post.adapter.out.persistence.repository.PostBookmarkJpaRepository;
import com.venueon.comment.adapter.out.persistence.repository.CommentJpaRepository;
import com.venueon.comment.adapter.out.persistence.repository.CommentLikeJpaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 어드민 게시글 영속성 어댑터 (Out-Adapter)
 * - 기존 PostJpaRepository 재사용 + 동적 쿼리를 위한 JPQL 사용
 */
@Component
@RequiredArgsConstructor
public class AdminPostPersistenceAdapter implements AdminPostRepositoryPort {

    private final PostJpaRepository postJpaRepository;
    private final PostLikeJpaRepository postLikeJpaRepository;
    private final PostBookmarkJpaRepository postBookmarkJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final CommentLikeJpaRepository commentLikeJpaRepository;
    private final EntityManager em;

    @Override
    public Optional<PostJpaEntity> findPostById(Long id) {
        return postJpaRepository.findById(id);
    }

    @Override
    public Page<PostJpaEntity> findPosts(String keyword, Long communityId, Boolean hidden, Pageable pageable) {
        StringBuilder jpql = new StringBuilder("SELECT p FROM PostJpaEntity p JOIN FETCH p.author JOIN FETCH p.community WHERE 1=1");
        StringBuilder countJpql = new StringBuilder("SELECT COUNT(p) FROM PostJpaEntity p WHERE 1=1");
        List<String> conditions = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            conditions.add(" AND (LOWER(p.title) LIKE :keyword OR LOWER(p.author.nickname) LIKE :keyword)");
        }
        if (communityId != null) {
            conditions.add(" AND p.community.id = :communityId");
        }
        if (hidden != null) {
            conditions.add(" AND p.hidden = :hidden");
        }

        for (String condition : conditions) {
            jpql.append(condition);
            countJpql.append(condition);
        }

        jpql.append(" ORDER BY p.createdAt DESC");

        // 데이터 쿼리
        TypedQuery<PostJpaEntity> query = em.createQuery(jpql.toString(), PostJpaEntity.class);
        // 카운트 쿼리
        TypedQuery<Long> countQuery = em.createQuery(countJpql.toString(), Long.class);

        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = "%" + keyword.toLowerCase() + "%";
            query.setParameter("keyword", kw);
            countQuery.setParameter("keyword", kw);
        }
        if (communityId != null) {
            query.setParameter("communityId", communityId);
            countQuery.setParameter("communityId", communityId);
        }
        if (hidden != null) {
            query.setParameter("hidden", hidden);
            countQuery.setParameter("hidden", hidden);
        }

        Long total = countQuery.getSingleResult();
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<PostJpaEntity> results = query.getResultList();
        return new PageImpl<>(results, pageable, total);
    }

    @Override
    public PostJpaEntity savePost(PostJpaEntity entity) {
        return postJpaRepository.save(entity);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        // 연관 데이터 정리 후 삭제 (기존 PostPersistenceAdapter.delete 로직과 동일)
        commentLikeJpaRepository.deleteByPostId(id);
        commentJpaRepository.deleteByPostId(id);
        postLikeJpaRepository.deleteByPostId(id);
        postBookmarkJpaRepository.deleteByPostId(id);
        postJpaRepository.deleteById(id);
    }
}
