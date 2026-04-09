package com.venueon.post.application.port.in.dto;

import com.venueon.post.domain.model.PostType;

import java.time.LocalDateTime;

/**
 * 게시글 목록 조회 시 프론트엔드에 전달할 응답 DTO.
 * 본문(content)은 목록에서 필요 없으므로 제외하여 데이터 전송량을 줄입니다.
 */
public record PostListResponse(
                Long id,
                String title,
                PostType type,
                String authorNickname,
                String content,
                int viewCount,
                int commentCount,
                int likeCount,
                boolean isBookmarked,
                boolean isPinned,
                boolean isNotice,
                LocalDateTime createdAt) {
}
