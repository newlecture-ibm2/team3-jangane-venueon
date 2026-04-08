package com.venueon.post.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.post.application.port.in.GetPostQuery;
import com.venueon.post.application.port.in.dto.PostListResponse;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.post.domain.model.PostType;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class PostQueryService implements GetPostQuery {

    private final PostRepositoryPort postRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, Pageable pageable) {
        return getPostsByCommunityId(communityId, type, pageable, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostListResponse> getPostsByCommunityId(Long communityId, PostType type, Pageable pageable, String email) {
        Page<Post> postPage;

        // 사용자 식별
        Long userId = (email != null && !email.isEmpty()) 
            ? userRepositoryPort.findByEmail(email).map(User::getId).orElse(null) 
            : null;

        if (type != null) {
            postPage = postRepositoryPort.findByCommunityIdAndType(communityId, type, pageable);
        } else {
            postPage = postRepositoryPort.findByCommunityId(communityId, pageable);
        }

        return postPage.map(post -> {
            boolean isBookmarked = (userId != null) && postRepositoryPort.existsBookmark(post.getId(), userId);
            
            return new PostListResponse(
                post.getId(),
                post.getTitle(),
                post.getType(),
                post.getAuthorNickname(),
                post.getContent(),
                post.getViewCount(),
                post.getCommentCount(),
                post.getLikeCount(),
                isBookmarked,
                post.getCreatedAt());
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostListResponse> getBookmarkedPosts(String email, Pageable pageable) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        return postRepositoryPort.findBookmarkedPostsByUserId(user.getId(), pageable)
                .map(post -> new PostListResponse(
                        post.getId(),
                        post.getTitle(),
                        post.getType(),
                        post.getAuthorNickname(),
                        post.getContent(),
                        post.getViewCount(),
                        post.getCommentCount(),
                        post.getLikeCount(),
                        true, // 북마크 목록이므로 무조건 true
                        post.getCreatedAt()));
    }
}
