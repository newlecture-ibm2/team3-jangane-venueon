package com.venueon.post.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.post.application.port.in.CreatePostUseCase;
import com.venueon.post.application.port.in.*;
import com.venueon.post.application.port.in.dto.CreatePostRequest;
import com.venueon.post.application.port.in.dto.CreatePostResponse;
import com.venueon.post.application.port.in.dto.UpdatePostRequest;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@UseCase
@RequiredArgsConstructor
@Transactional
public class PostCommandService implements CreatePostUseCase, PostLikeUseCase, PostBookmarkUseCase, PostAdminUseCase,
                UpdatePostUseCase, DeletePostUseCase {

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
        public void updatePost(Long id, UpdatePostRequest request) {
                Post post = postRepositoryPort.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));

                post.update(request.title(), request.content(), request.type());
                postRepositoryPort.save(post);
        }

        @Override
        public void deletePost(Long id) {
                postRepositoryPort.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));

                postRepositoryPort.delete(id);
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

        @Override
        public void toggleBookmark(Long postId, String email) {
                // 비로그인 사용자 대응 (익명 계정)
                String targetEmail = (email == null || email.isEmpty()) ? "admin@venueon.com" : email;
                User user = userRepositoryPort.findByEmail(targetEmail)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User not found with email: " + targetEmail));

                postRepositoryPort.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

                if (postRepositoryPort.existsBookmark(postId, user.getId())) {
                        postRepositoryPort.deleteBookmark(postId, user.getId());
                } else {
                        postRepositoryPort.saveBookmark(postId, user.getId());
                }
        }

        @Override
        public void togglePin(Long postId) {
                Post post = postRepositoryPort.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

                post.togglePin();
                postRepositoryPort.save(post);
        }

        @Override
        public void toggleNotice(Long postId) {
                Post post = postRepositoryPort.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

                post.toggleNotice();
                postRepositoryPort.save(post);
        }

        @Override
        public void hidePost(Long postId) {
                Post post = postRepositoryPort.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
                post.hide();
                postRepositoryPort.save(post);
        }

}
