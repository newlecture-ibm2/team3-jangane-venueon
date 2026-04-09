package com.venueon.post.adapter.in.web;

import com.venueon.post.application.port.in.CreatePostUseCase;
import com.venueon.post.application.port.in.GetPostQuery;
import com.venueon.post.application.port.in.PostAdminUseCase;
import com.venueon.post.application.port.in.PostBookmarkUseCase;
import com.venueon.post.application.port.in.PostLikeUseCase;
import com.venueon.post.application.port.in.dto.CreatePostRequest;
import com.venueon.post.application.port.in.dto.CreatePostResponse;
import com.venueon.post.application.port.in.dto.PostListResponse;
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
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final CreatePostUseCase createPostUseCase;
    private final GetPostQuery getPostQuery;
    private final PostLikeUseCase postLikeUseCase;
    private final PostBookmarkUseCase postBookmarkUseCase;
    private final PostAdminUseCase postAdminUseCase;

    /**
     * 1단계: 게시글 등록
     * POST /posts
     */
    @PostMapping
    public ResponseEntity<CreatePostResponse> createPost(@RequestBody CreatePostRequest request) {
        // SecurityContext에서 로그인된 사용자의 email 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = "admin@venueon.com"; // 기본값 (비회원 익명작성용)

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        CreatePostResponse response = createPostUseCase.createPost(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 2단계 + 3단계: 특정 커뮤니티의 게시글 목록 조회 (페이징 + 타입 필터)
     *
     * 사용 예시:
     * GET /posts?communityId=1 → 전체 목록
     * GET /posts?communityId=1&type=NOTICE → 공지사항만
     * GET /posts?communityId=1&page=0&size=10&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<PostListResponse>> getPostList(
            @RequestParam Long communityId,
            @RequestParam(required = false) PostType type,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        Page<PostListResponse> posts = getPostQuery.getPostsByCommunityId(communityId, type, pageable, email);
        return ResponseEntity.ok(posts);
    }

    /**
     * 게시글 좋아요 토글
     * POST /posts/{id}/like
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        postLikeUseCase.toggleLike(id, email);
        return ResponseEntity.ok().build();
    }

    /**
     * 게시물 북마크 토글
     * POST /posts/{id}/bookmark
     */
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<Void> toggleBookmark(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        postBookmarkUseCase.toggleBookmark(id, email);
        return ResponseEntity.ok().build();
    }

    /**
     * 내 북마크 목록 조회
     * GET /posts/bookmarks/me
     */
    @GetMapping("/bookmarks/me")
    public ResponseEntity<Page<PostListResponse>> getMyBookmarks(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        Page<PostListResponse> bookmarks = getPostQuery.getBookmarkedPosts(email, pageable);
        return ResponseEntity.ok(bookmarks);
    }

    /**
     * 게시글 상단 고정 토글
     * PATCH /posts/{id}/pin
     */
    @PatchMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(@PathVariable Long id) {
        postAdminUseCase.togglePin(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 게시글 공지 설정 토글
     * PATCH /posts/{id}/notice
     */
    @PatchMapping("/{id}/notice")
    public ResponseEntity<Void> toggleNotice(@PathVariable Long id) {
        postAdminUseCase.toggleNotice(id);
        return ResponseEntity.ok().build();
    }
}
