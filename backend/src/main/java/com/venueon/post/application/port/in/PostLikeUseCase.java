package com.venueon.post.application.port.in;

public interface PostLikeUseCase {
    void toggleLike(Long postId, String email);
}
