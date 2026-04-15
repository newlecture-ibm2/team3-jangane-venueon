package com.venueon.post.application.port.in;

import com.venueon.post.application.port.in.dto.PostListResponse;
import com.venueon.post.domain.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GetPostQuery {
    Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, String keyword, Pageable pageable);
    
    // 북마크 상태 확인을 위해 이메일이 포함된 조회 추가
    Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, String keyword, Pageable pageable, String email);

    // 내 북마크 목록만 모아보기
    Page<PostListResponse> getBookmarkedPosts(String email, Pageable pageable);

    // 게시글 상세 조회 (수정용)
    PostListResponse getPostById(Long id);
}
