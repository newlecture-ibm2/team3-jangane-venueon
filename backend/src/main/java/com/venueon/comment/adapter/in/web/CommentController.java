package com.venueon.comment.adapter.in.web;

import com.venueon.comment.application.port.in.CreateCommentUseCase;
import com.venueon.comment.application.port.in.GetCommentQuery;
import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.in.dto.CreateCommentRequest;
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
}
