package com.venueon.post.application.port.in;

public interface DeletePostUseCase {
    void deletePost(Long id, String email);
}
