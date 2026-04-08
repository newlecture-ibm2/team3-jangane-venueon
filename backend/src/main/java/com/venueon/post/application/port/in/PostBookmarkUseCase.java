package com.venueon.post.application.port.in;

public interface PostBookmarkUseCase {
    void toggleBookmark(Long postId, String email);
}
