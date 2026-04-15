package com.venueon.admin.community.application.port.in;

import com.venueon.admin.community.domain.model.ContentStatus;

/**
 * 어드민 커뮤니티 게시글 상태 변경 UseCase (Inbound Port)
 */
public interface UpdatePostStatusUseCase {

    /**
     * 게시글 상태를 변경한다.
     *
     * @param postId 대상 게시글 ID
     * @param status 변경할 상태 (ACTIVE, HIDDEN, DELETED)
     */
    void updatePostStatus(Long postId, ContentStatus status);
}
