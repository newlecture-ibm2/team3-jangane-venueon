package com.venueon.post.application.port.in;

import com.venueon.post.application.port.in.dto.UpdatePostRequest;

public interface UpdatePostUseCase {
    void updatePost(Long id, UpdatePostRequest request, String email);
}
