package com.venueon.post.application.service;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.post.application.port.in.dto.CreatePostRequest;
import com.venueon.post.application.port.in.dto.CreatePostResponse;
import com.venueon.post.application.port.in.dto.PostListResponse;
import com.venueon.post.domain.model.PostType;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostJpaRepository postJpaRepository;
    private final CommunityJpaRepository communityJpaRepository;
    private final UserJpaRepository userJpaRepository;

    // ──────────────────────────────────────────
    // 1단계: 게시글 등록 (개선 - 응답 DTO 적용)
    // ──────────────────────────────────────────

    @Transactional
    public CreatePostResponse createPost(CreatePostRequest request) {
        // 커뮤니티(방) 존재 확인
        CommunityJpaEntity community = communityJpaRepository.findById(request.communityId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Community not found with id: " + request.communityId()));

        // 작성자(유저) 존재 확인
        UserJpaEntity author = userJpaRepository.findById(request.authorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found with id: " + request.authorId()));

        // Entity 조립 및 저장
        PostJpaEntity postEntity = PostJpaEntity.builder()
                .community(community)
                .author(author)
                .title(request.title())
                .content(request.content())
                .type(request.type())
                .build();

        PostJpaEntity savedPost = postJpaRepository.save(postEntity);

        return new CreatePostResponse(
                savedPost.getId(),
                savedPost.getTitle(),
                savedPost.getCreatedAt()
        );
    }

    // ──────────────────────────────────────────
    // 2단계: 게시글 목록 조회 (페이징 + 타입 필터 포함)
    // ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, Pageable pageable) {
        Page<PostJpaEntity> postPage;

        if (type != null) {
            // 타입 필터가 있으면 타입별 조회
            postPage = postJpaRepository.findByCommunityIdAndType(communityId, type, pageable);
        } else {
            // 타입 필터가 없으면 전체 조회
            postPage = postJpaRepository.findByCommunityId(communityId, pageable);
        }

        // Entity → 응답 DTO 변환
        return postPage.map(PostListResponse::from);
    }
}
