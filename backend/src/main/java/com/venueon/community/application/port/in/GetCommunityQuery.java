package com.venueon.community.application.port.in;

import com.venueon.community.application.port.in.dto.CommunityResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GetCommunityQuery {
    Page<CommunityResponse> getPublicCommunities(Pageable pageable, String email);
    Page<CommunityResponse> getJoinedCommunities(Pageable pageable, String email);
    CommunityResponse getCommunityById(Long id, String email);
}
