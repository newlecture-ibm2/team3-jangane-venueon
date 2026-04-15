package com.venueon.admin.community.adapter.in.web;

import com.venueon.admin.community.adapter.in.web.dto.request.AdminUpdateStatusRequest;
import com.venueon.admin.community.adapter.in.web.dto.response.AdminCommentListResponse;
import com.venueon.admin.community.adapter.in.web.dto.response.AdminCommunityListResponse;
import com.venueon.admin.community.adapter.in.web.dto.response.AdminPostListResponse;
import com.venueon.admin.community.application.port.in.*;
import com.venueon.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 어드민 커뮤니티 관리 API Controller
 * - UseCase 인터페이스에만 의존 (Service 구현체 직접 참조 ✕)
 * - 게시글 및 댓글 상태 관리 (숨김/삭제/복구)
 */
@Slf4j
@RestController
@RequestMapping("/admin/community")
@RequiredArgsConstructor
public class AdminCommunityController {

    private final GetAdminPostListUseCase getAdminPostListUseCase;
    private final UpdatePostStatusUseCase updatePostStatusUseCase;
    private final GetAdminCommentListUseCase getAdminCommentListUseCase;
    private final UpdateCommentStatusUseCase updateCommentStatusUseCase;
    private final GetAdminCommunityListUseCase getAdminCommunityListUseCase;

    // ── 커뮤니티(게시판) 관리 ──

    /**
     * GET /admin/community — 전체 커뮤니티 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminCommunityListResponse>>> getCommunities() {
        log.debug("어드민 커뮤니티 목록 조회");
        List<AdminCommunityListResponse> response = getAdminCommunityListUseCase.getCommunities();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── 게시글 관리 ──

    /**
     * GET /admin/community/posts — 게시글 목록 조회 (검색 + 필터 + 페이징)
     *
     * @param keyword     검색어 (제목 또는 작성자)
     * @param communityId 커뮤니티 ID 필터
     * @param hidden      숨김 여부 필터
     * @param pageable    페이징
     */
    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<AdminPostListResponse>>> getPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long communityId,
            @RequestParam(required = false) Boolean hidden,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.debug("어드민 게시글 목록 조회: keyword={}, communityId={}, hidden={}", keyword, communityId, hidden);

        try {
            Page<AdminPostListResponse> response = getAdminPostListUseCase.getPosts(keyword, communityId, hidden, pageable);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Throwable e) {
            log.error("게시글 검색 API 오류", e);
            String errorMsg = e.toString() + (e.getCause() != null ? " | Cause: " + e.getCause().toString() : "");
            // 원인 파악을 위해 예외 메시지를 그대로 응답에 내려보냅니다.
            return ResponseEntity.status(500).body(new ApiResponse(false, errorMsg, null));
        }
    }

    /**
     * PATCH /admin/community/posts/{id}/status — 게시글 상태 변경 (ACTIVE, HIDDEN, DELETED)
     */
    @PatchMapping("/posts/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updatePostStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateStatusRequest request) {

        log.debug("어드민 게시글 상태 변경: id={}, status={}", id, request.status());

        updatePostStatusUseCase.updatePostStatus(id, request.status());
        return ResponseEntity.ok(ApiResponse.success());
    }

    // ── 댓글 관리 ──

    /**
     * GET /admin/community/posts/{postId}/comments — 특정 게시글의 댓글 목록 조회
     */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<List<AdminCommentListResponse>>> getComments(
            @PathVariable Long postId) {

        log.debug("어드민 댓글 목록 조회: postId={}", postId);

        List<AdminCommentListResponse> response = getAdminCommentListUseCase.getCommentsByPostId(postId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /admin/community/comments/{id}/status — 댓글 상태 변경 (ACTIVE, HIDDEN, DELETED)
     */
    @PatchMapping("/comments/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateCommentStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateStatusRequest request) {

        log.debug("어드민 댓글 상태 변경: id={}, status={}", id, request.status());

        updateCommentStatusUseCase.updateCommentStatus(id, request.status());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
