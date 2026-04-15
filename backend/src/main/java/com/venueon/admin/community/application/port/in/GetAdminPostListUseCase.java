package com.venueon.admin.community.application.port.in;

import com.venueon.admin.community.adapter.in.web.dto.response.AdminPostListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 어드민 커뮤니티 게시글 목록 조회 UseCase (Inbound Port)
 */
public interface GetAdminPostListUseCase {

    /**
     * 게시글 목록을 조회한다. (키워드 검색 + 커뮤니티 필터 + 숨김 여부 필터)
     *
     * @param keyword     검색어 (제목 또는 작성자)
     * @param communityId 커뮤니티 ID (null이면 전체)
     * @param hidden      숨김 여부 필터 (null이면 전체)
     * @param pageable    페이징
     * @return 게시글 목록
     */
    Page<AdminPostListResponse> getPosts(String keyword, Long communityId, Boolean hidden, Pageable pageable);
}
