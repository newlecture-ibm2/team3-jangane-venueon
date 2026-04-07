package com.venueon.community.application.port.in;

import com.venueon.community.application.port.in.dto.CommunityResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GetCommunityQuery {
    Page<CommunityResponse> getPublicCommunities(Pageable pageable);
    CommunityResponse getCommunityById(Long id);
}
