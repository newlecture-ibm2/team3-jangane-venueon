package com.venueon.post.application.port.in.dto;

import com.venueon.post.domain.model.PostType;

public record CreatePostRequest(
        Long communityId,
        Long authorId,
        String title,
        String content,
        PostType type
) {
}
