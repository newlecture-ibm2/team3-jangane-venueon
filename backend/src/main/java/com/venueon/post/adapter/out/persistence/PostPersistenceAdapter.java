package com.venueon.post.adapter.out.persistence;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.post.adapter.out.persistence.entity.PostBookmarkJpaEntity;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.entity.PostLikeJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostBookmarkJpaRepository;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.post.adapter.out.persistence.repository.PostLikeJpaRepository;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.post.domain.model.PostType;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PostPersistenceAdapter implements PostRepositoryPort {

    private final PostJpaRepository postJpaRepository;
    private final PostLikeJpaRepository postLikeJpaRepository;
    private final PostBookmarkJpaRepository postBookmarkJpaRepository;
    private final CommunityJpaRepository communityJpaRepository;
    private final UserJpaRepository userRepository;

    @Override
    public Post save(Post post) {
        CommunityJpaEntity community = communityJpaRepository.findById(post.getCommunityId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Community not found with id: " + post.getCommunityId()));

        UserJpaEntity author = userRepository.findById(post.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + post.getAuthorId()));

        PostJpaEntity postEntity = PostJpaEntity.builder()
                .community(community)
                .author(author)
                .title(post.getTitle())
                .content(post.getContent())
                .type(post.getType())
                .build();

        if (post.getId() != null) {
            PostJpaEntity existing = postJpaRepository.findById(post.getId()).orElse(null);
            if (existing != null) {
                postEntity = PostJpaEntity.builder()
                        .id(post.getId())
                        .community(existing.getCommunity())
                        .author(existing.getAuthor())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .type(post.getType())
                        .viewCount(post.getViewCount())
                        .commentCount(post.getCommentCount())
                        .likeCount(post.getLikeCount())
                        .isHidden(existing.isHidden())
                        .isPinned(post.isPinned())
                        .isNotice(post.isNotice())
                        .createdAt(existing.getCreatedAt())
                        .build();
            }
        }

        PostJpaEntity savedPost = postJpaRepository.save(postEntity);
        return mapToDomain(savedPost);
    }

    @Override
    public Optional<Post> findById(Long id) {
        return postJpaRepository.findById(id).map(this::mapToDomain);
    }

    @Override
    public Page<Post> findByCommunityId(Long communityId, Pageable pageable) {
        return postJpaRepository.findByCommunityIdOrderByIsNoticeDescIsPinnedDescCreatedAtDesc(communityId, pageable)
                .map(this::mapToDomain);
    }

    @Override
    public Page<Post> findByCommunityIdAndType(Long communityId, PostType type, Pageable pageable) {
        return postJpaRepository.findByCommunityIdAndTypeOrderByIsNoticeDescIsPinnedDescCreatedAtDesc(communityId, type, pageable)
                .map(this::mapToDomain);
    }

    @Override
    public boolean existsLike(Long postId, Long userId) {
        return postLikeJpaRepository.existsByPostIdAndUserId(postId, userId);
    }

    @Override
    public void saveLike(Long postId, Long userId) {
        PostJpaEntity post = postJpaRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        PostLikeJpaEntity like = PostLikeJpaEntity.builder()
                .post(post)
                .user(user)
                .build();
        postLikeJpaRepository.save(like);
    }

    @Override
    public void deleteLike(Long postId, Long userId) {
        postLikeJpaRepository.deleteByPostIdAndUserId(postId, userId);
    }

    @Override
    public boolean existsBookmark(Long postId, Long userId) {
        return postBookmarkJpaRepository.existsByPostIdAndUserId(postId, userId);
    }

    @Override
    public void saveBookmark(Long postId, Long userId) {
        PostJpaEntity post = postJpaRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        PostBookmarkJpaEntity bookmark = PostBookmarkJpaEntity.builder()
                .post(post)
                .user(user)
                .build();
        postBookmarkJpaRepository.save(bookmark);
    }

    @Override
    public void deleteBookmark(Long postId, Long userId) {
        postBookmarkJpaRepository.deleteByPostIdAndUserId(postId, userId);
    }

    @Override
    public Page<Post> findBookmarkedPostsByUserId(Long userId, Pageable pageable) {
        return postBookmarkJpaRepository.findAllByUserId(userId, pageable)
                .map(bookmark -> mapToDomain(bookmark.getPost()));
    }

    private Post mapToDomain(PostJpaEntity entity) {
        return Post.builder()
                .id(entity.getId())
                .communityId(entity.getCommunity().getId())
                .authorId(entity.getAuthor().getId())
                .authorNickname(entity.getAuthor().getNickname())
                .authorProfileImg(entity.getAuthor().getProfileImg())
                .title(entity.getTitle())
                .content(entity.getContent())
                .type(entity.getType())
                .viewCount(entity.getViewCount())
                .commentCount(entity.getCommentCount())
                .likeCount(entity.getLikeCount())
                .isPinned(entity.isPinned())
                .isNotice(entity.isNotice())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}