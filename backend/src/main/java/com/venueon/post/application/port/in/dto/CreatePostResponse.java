package com.venueon.post.application.port.in.dto;

import java.time.LocalDateTime;

/**
 * 게시글 생성 성공 시 프론트엔드에 반환할 응답 DTO.
 * 단순 ID만 반환하던 것을 개선하여, 프론트에서 바로 활용할 수 있는 최소 정보를 함께 제공합니다.
 */
public record CreatePostResponse(
        Long id,
        String title,
        LocalDateTime createdAt
) {
}
