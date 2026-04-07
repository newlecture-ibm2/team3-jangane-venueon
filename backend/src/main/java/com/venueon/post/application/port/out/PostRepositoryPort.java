package com.venueon.post.application.port.out;

import com.venueon.post.domain.model.Post;
import com.venueon.post.domain.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostRepositoryPort {
    Post save(Post post);
    Page<Post> findByCommunityId(Long communityId, Pageable pageable);
    Page<Post> findByCommunityIdAndType(Long communityId, PostType type, Pageable pageable);
}
