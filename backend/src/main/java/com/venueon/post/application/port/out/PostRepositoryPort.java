package com.venueon.post.application.port.out;

import com.venueon.post.domain.model.Post;
import com.venueon.post.domain.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PostRepositoryPort {
    Post save(Post post);

    Optional<Post> findById(Long id);

    Page<Post> findByCommunityId(Long communityId, Pageable pageable);

    Page<Post> findByCommunityIdAndType(Long communityId, PostType type, Pageable pageable);
    
    Page<Post> findByKeyword(Long communityId, PostType type, String keyword, Pageable pageable);

    boolean existsLike(Long postId, Long userId);

    void saveLike(Long postId, Long userId);

    void deleteLike(Long postId, Long userId);

    boolean existsBookmark(Long postId, Long userId);
    void saveBookmark(Long postId, Long userId);
    void deleteBookmark(Long postId, Long userId);
    
    Page<Post> findBookmarkedPostsByUserId(Long userId, Pageable pageable);
    
    void delete(Long id);

    java.time.LocalDateTime findLatestPostDateByCommunityId(Long communityId);
}
