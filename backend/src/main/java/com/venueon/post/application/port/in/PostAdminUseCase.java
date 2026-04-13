package com.venueon.post.application.port.in;

public interface PostAdminUseCase {
    void togglePin(Long postId);
    void toggleNotice(Long postId);
    void hidePost(Long postId);
    void deletePost(Long postId);
}
