package com.venueon.post.adapter.out.persistence;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.post.adapter.out.persistence.entity.PostBookmarkJpaEntity;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.entity.PostLikeJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostBookmarkJpaRepository;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.post.adapter.out.persistence.repository.PostLikeJpaRepository;
import com.venueon.comment.adapter.out.persistence.repository.CommentJpaRepository;
import com.venueon.comment.adapter.out.persistence.repository.CommentLikeJpaRepository;
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
    private final CommentJpaRepository commentJpaRepository;
    private final CommentLikeJpaRepository commentLikeJpaRepository;
    private final CommunityJpaRepository communityJpaRepository;
    private final UserJpaRepository userRepository;

    @Override
    public Post save(Post post) {
        CommunityJpaEntity community = communityJpaRepository.findById(post.getCommunityId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Community not found with id: " + post.getCommunityId()));

        UserJpaEntity author = userRepository.findById(post.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + post.getAuthorId()));

        if (post.getId() != null) {
            PostJpaEntity existing = postJpaRepository.findById(post.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + post.getId()));
            
            existing.setTitle(post.getTitle());
            existing.setContent(post.getContent());
            existing.setType(post.getType());
            existing.setPinned(post.isPinned());
            existing.setNotice(post.isNotice());
            existing.setViewCount(post.getViewCount());
            existing.setCommentCount(post.getCommentCount());
            existing.setLikeCount(post.getLikeCount());
            
            PostJpaEntity savedPost = postJpaRepository.save(existing);
            return mapToDomain(savedPost);
        }

        PostJpaEntity postEntity = PostJpaEntity.builder()
                .community(community)
                .author(author)
                .title(post.getTitle())
                .content(post.getContent())
                .type(post.getType())
                .isPinned(post.isPinned())
                .isNotice(post.isNotice())
                .build();

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
    public Page<Post> findByKeyword(Long communityId, PostType type, String keyword, Pageable pageable) {
        return postJpaRepository.searchByKeyword(communityId, type, keyword, pageable)
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

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void delete(Long id) {
        commentLikeJpaRepository.deleteByPostId(id);
        commentJpaRepository.deleteByPostId(id);
        postLikeJpaRepository.deleteByPostId(id);
        postBookmarkJpaRepository.deleteByPostId(id);
        postJpaRepository.deleteById(id);
    }

    @Override
    public java.time.LocalDateTime findLatestPostDateByCommunityId(Long communityId) {
        return postJpaRepository.findMaxCreatedAtByCommunityId(communityId);
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