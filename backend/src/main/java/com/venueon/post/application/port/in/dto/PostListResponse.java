package com.venueon.post.application.port.in.dto;

import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
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
        int viewCount,
        int commentCount,
        LocalDateTime createdAt
) {
    /**
     * JPA Entity → 응답 DTO 변환 정적 팩토리 메서드
     */
    public static PostListResponse from(PostJpaEntity entity) {
        return new PostListResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getType(),
                entity.getAuthor().getNickname(),
                entity.getViewCount(),
                entity.getCommentCount(),
                entity.getCreatedAt()
        );
    }
}
