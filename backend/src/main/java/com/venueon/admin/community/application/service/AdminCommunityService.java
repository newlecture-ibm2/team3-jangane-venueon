package com.venueon.admin.community.application.service;

import com.venueon.admin.community.adapter.in.web.dto.response.AdminCommentListResponse;
import com.venueon.admin.community.adapter.in.web.dto.response.AdminCommunityListResponse;
import com.venueon.admin.community.adapter.in.web.dto.response.AdminPostListResponse;
import com.venueon.admin.community.application.port.in.*;
import com.venueon.admin.community.application.port.out.AdminCommentRepositoryPort;
import com.venueon.admin.community.application.port.out.AdminCommunityRepositoryPort;
import com.venueon.admin.community.application.port.out.AdminPostRepositoryPort;
import com.venueon.admin.community.domain.model.ContentStatus;
import com.venueon.comment.adapter.out.persistence.entity.CommentJpaEntity;
import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 어드민 커뮤니티 관리 서비스
 * - 게시글/댓글의 상태 변경(숨김, 삭제) 및 목록 조회
 * - Port(AdminPostRepositoryPort, AdminCommentRepositoryPort)만 의존
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCommunityService implements
        UpdatePostStatusUseCase,
        UpdateCommentStatusUseCase,
        GetAdminPostListUseCase,
        GetAdminCommentListUseCase,
        GetAdminCommunityListUseCase {

    private final AdminPostRepositoryPort adminPostRepositoryPort;
    private final AdminCommentRepositoryPort adminCommentRepositoryPort;
    private final AdminCommunityRepositoryPort adminCommunityRepositoryPort;

    // ── 게시글 상태 변경 ──

    @Override
    @Transactional
    public void updatePostStatus(Long postId, ContentStatus status) {
        PostJpaEntity post = adminPostRepositoryPort.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다. id=" + postId));

        switch (status) {
            case ACTIVE -> {
                post.setHidden(false);
                adminPostRepositoryPort.savePost(post);
                log.info("게시글 활성화: id={}", postId);
            }
            case HIDDEN -> {
                post.setHidden(true);
                adminPostRepositoryPort.savePost(post);
                log.info("게시글 숨김 처리: id={}", postId);
            }
            case DELETED -> {
                adminPostRepositoryPort.deletePost(postId);
                log.info("게시글 삭제 처리: id={}", postId);
            }
        }
    }

    // ── 댓글 상태 변경 ──

    @Override
    @Transactional
    public void updateCommentStatus(Long commentId, ContentStatus status) {
        CommentJpaEntity comment = adminCommentRepositoryPort.findCommentById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "댓글을 찾을 수 없습니다. id=" + commentId));

        switch (status) {
            case ACTIVE -> {
                comment.setHidden(false);
                adminCommentRepositoryPort.saveComment(comment);
                log.info("댓글 활성화: id={}", commentId);
            }
            case HIDDEN -> {
                comment.setHidden(true);
                adminCommentRepositoryPort.saveComment(comment);
                log.info("댓글 숨김 처리: id={}", commentId);
            }
            case DELETED -> {
                // 소프트 삭제: 내용 치환 + 숨김 처리
                comment.setContent("관리자에 의해 삭제된 댓글입니다.");
                comment.setHidden(true);
                adminCommentRepositoryPort.saveComment(comment);
                log.info("댓글 삭제(소프트) 처리: id={}", commentId);
            }
        }
    }

    // ── 게시글 목록 조회 ──

    @Override
    public Page<AdminPostListResponse> getPosts(String keyword, Long communityId, Boolean hidden, Pageable pageable) {
        Page<PostJpaEntity> posts = adminPostRepositoryPort.findPosts(keyword, communityId, hidden, pageable);
        return posts.map(AdminPostListResponse::from);
    }

    // ── 댓글 목록 조회 ──

    @Override
    public List<AdminCommentListResponse> getCommentsByPostId(Long postId) {
        List<CommentJpaEntity> comments = adminCommentRepositoryPort.findCommentsByPostId(postId);
        return comments.stream()
                .map(AdminCommentListResponse::from)
                .collect(Collectors.toList());
    }

    // ── 커뮤니티 목록 조회 ──

    @Override
    public List<AdminCommunityListResponse> getCommunities() {
        return adminCommunityRepositoryPort.findAllCommunities().stream()
                .map(AdminCommunityListResponse::from)
                .collect(Collectors.toList());
    }
}
