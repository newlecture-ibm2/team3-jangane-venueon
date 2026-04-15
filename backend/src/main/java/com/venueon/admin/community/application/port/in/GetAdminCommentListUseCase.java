package com.venueon.admin.community.application.port.in;

import com.venueon.admin.community.adapter.in.web.dto.response.AdminCommentListResponse;
import java.util.List;

/**
 * 어드민 커뮤니티 댓글 목록 조회 UseCase (Inbound Port)
 */
public interface GetAdminCommentListUseCase {

    /**
     * 특정 게시글의 댓글 목록을 조회한다.
     *
     * @param postId 게시글 ID
     * @return 댓글 목록
     */
    List<AdminCommentListResponse> getCommentsByPostId(Long postId);
}
