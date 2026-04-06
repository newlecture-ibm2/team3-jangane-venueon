package com.venueon.post.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.post.application.port.in.GetPostQuery;
import com.venueon.post.application.port.in.dto.PostListResponse;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.post.domain.model.PostType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class PostQueryService implements GetPostQuery {

    private final PostRepositoryPort postRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, Pageable pageable) {
        Page<Post> postPage;

        if (type != null) {
            postPage = postRepositoryPort.findByCommunityIdAndType(communityId, type, pageable);
        } else {
            postPage = postRepositoryPort.findByCommunityId(communityId, pageable);
        }

        return postPage.map(post -> new PostListResponse(
                post.getId(),
                post.getTitle(),
                post.getType(),
                post.getAuthorNickname(),
                post.getContent(),
                0, // viewCount (가설 추가)
                0, // commentCount (가설 추가)
                post.getCreatedAt()
        ));
    }
}
