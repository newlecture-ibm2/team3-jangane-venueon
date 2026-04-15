package com.venueon.admin.community.application.port.in;

import com.venueon.admin.community.domain.model.ContentStatus;

/**
 * 어드민 커뮤니티 댓글 상태 변경 UseCase (Inbound Port)
 */
public interface UpdateCommentStatusUseCase {

    /**
     * 댓글 상태를 변경한다.
     *
     * @param commentId 대상 댓글 ID
     * @param status    변경할 상태 (ACTIVE, HIDDEN, DELETED)
     */
    void updateCommentStatus(Long commentId, ContentStatus status);
}
