package com.venueon.post.adapter.in.web;

import com.venueon.post.application.port.in.dto.CreatePostRequest;
import com.venueon.post.application.port.in.dto.CreatePostResponse;
import com.venueon.post.application.port.in.dto.PostListResponse;
import com.venueon.post.application.service.PostService;
import com.venueon.post.domain.model.PostType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * 1단계: 게시글 등록
     * POST /api/v1/posts
     */
    @PostMapping
    public ResponseEntity<CreatePostResponse> createPost(@RequestBody CreatePostRequest request) {
        // SecurityContext에서 로그인된 사용자의 email 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();

        CreatePostResponse response = postService.createPost(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 2단계 + 3단계: 특정 커뮤니티의 게시글 목록 조회 (페이징 + 타입 필터)
     *
     * 사용 예시:
     *   GET /api/v1/posts?communityId=1                           → 전체 목록
     *   GET /api/v1/posts?communityId=1&type=NOTICE               → 공지사항만
     *   GET /api/v1/posts?communityId=1&page=0&size=10&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<PostListResponse>> getPostList(
            @RequestParam Long communityId,
            @RequestParam(required = false) PostType type,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<PostListResponse> posts = postService.getPostsByCommunityId(communityId, type, pageable);
        return ResponseEntity.ok(posts);
    }
}
