package com.venueon.admin.community.application.port.in;

import com.venueon.admin.community.adapter.in.web.dto.response.AdminCommunityListResponse;
import java.util.List;

/**
 * 어드민 커뮤니티 목록 조회 UseCase
 */
public interface GetAdminCommunityListUseCase {
    List<AdminCommunityListResponse> getCommunities();
}
