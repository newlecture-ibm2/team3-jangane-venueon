package com.venueon.post.adapter.out.persistence;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.post.domain.model.PostType;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostPersistenceAdapter implements PostRepositoryPort {

    private final PostJpaRepository postJpaRepository;
    private final CommunityJpaRepository communityJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public Post save(Post post) {
        CommunityJpaEntity community = communityJpaRepository.findById(post.getCommunityId())
                .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + post.getCommunityId()));

        UserJpaEntity author = userJpaRepository.findById(post.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + post.getAuthorId()));

        PostJpaEntity postEntity = PostJpaEntity.builder()
                .community(community)
                .author(author)
                .title(post.getTitle())
                .content(post.getContent())
                .type(post.getType())
                .build();
                
        if (post.getId() != null) {
            // update handling logic 
        }

        PostJpaEntity savedPost = postJpaRepository.save(postEntity);
        return mapToDomain(savedPost);
    }

    @Override
    public Page<Post> findByCommunityId(Long communityId, Pageable pageable) {
        return postJpaRepository.findByCommunityId(communityId, pageable)
                .map(this::mapToDomain);
    }

    @Override
    public Page<Post> findByCommunityIdAndType(Long communityId, PostType type, Pageable pageable) {
        return postJpaRepository.findByCommunityIdAndType(communityId, type, pageable)
                .map(this::mapToDomain);
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
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
