package com.venueon.comment.application.port.in;

import com.venueon.comment.application.port.in.dto.UpdateCommentRequest;

public interface UpdateCommentUseCase {
    void updateComment(Long id, UpdateCommentRequest request);
}
