package com.venueon.post.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.post.application.port.in.CreatePostUseCase;
import com.venueon.post.application.port.in.PostLikeUseCase;
import com.venueon.post.application.port.in.dto.CreatePostRequest;
import com.venueon.post.application.port.in.dto.CreatePostResponse;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
public class PostCommandService implements CreatePostUseCase, PostLikeUseCase {

        private final PostRepositoryPort postRepositoryPort;
        private final UserRepositoryPort userRepositoryPort;

        @Override
        @Transactional
        public CreatePostResponse createPost(CreatePostRequest request, String email) {
                User author = userRepositoryPort.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

                Post post = Post.builder()
                                .communityId(request.communityId())
                                .authorId(author.getId())
                                .title(request.title())
                                .content(request.content())
                                .type(request.type())
                                .build();

                Post savedPost = postRepositoryPort.save(post);

                return new CreatePostResponse(
                                savedPost.getId(),
                                savedPost.getTitle(),
                                savedPost.getCreatedAt());
        }

        @Override
        @Transactional
        public void toggleLike(Long postId, String email) {
                User user = userRepositoryPort.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

                Post post = postRepositoryPort.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

                if (postRepositoryPort.existsLike(postId, user.getId())) {
                        postRepositoryPort.deleteLike(postId, user.getId());
                        post.decrementLikeCount();
                } else {
                        postRepositoryPort.saveLike(postId, user.getId());
                        post.incrementLikeCount();
                }

                postRepositoryPort.save(post);
        }
}
