package com.venueon.post.application.port.in;

import com.venueon.post.application.port.in.dto.PostListResponse;
import com.venueon.post.domain.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GetPostQuery {
    Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, Pageable pageable);
}
