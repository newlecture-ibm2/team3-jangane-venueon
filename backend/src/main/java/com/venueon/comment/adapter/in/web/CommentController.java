package com.venueon.comment.adapter.in.web;

import com.venueon.comment.application.port.in.*;
import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.in.dto.CreateCommentRequest;
import com.venueon.comment.application.port.in.dto.UpdateCommentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CreateCommentUseCase createCommentUseCase;
    private final GetCommentQuery getCommentQuery;
    private final CommentLikeUseCase commentLikeUseCase;
    private final UpdateCommentUseCase updateCommentUseCase;
    private final DeleteCommentUseCase deleteCommentUseCase;

    /**
     * 댓글 수정 API
     * PUT /comments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateComment(@PathVariable Long id, @RequestBody UpdateCommentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = "admin@venueon.com"; // 기본값
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        updateCommentUseCase.updateComment(id, request, email);
        return ResponseEntity.ok().build();
    }

    /**
     * 댓글 삭제 API
     * DELETE /comments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = "admin@venueon.com"; // 기본값
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        deleteCommentUseCase.deleteComment(id, email);
        return ResponseEntity.ok().build();
    }

    /**
     * 댓글 등록 API
     * POST /comments
     */
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@RequestBody CreateCommentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = "admin@venueon.com"; // 기본값 (비회원 익명작성용)

        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        CommentResponse response = createCommentUseCase.createComment(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 특정 게시글의 댓글 목록 조회 API
     * GET /comments?postId={postId}
     */
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@RequestParam Long postId) {
        List<CommentResponse> responses = getCommentQuery.getCommentsByPostId(postId);
        return ResponseEntity.ok(responses);
    }

    /**
     * 댓글 좋아요 토글
     * POST /comments/{id}/like
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        commentLikeUseCase.toggleLike(id, email);
        return ResponseEntity.ok().build();
    }
}
