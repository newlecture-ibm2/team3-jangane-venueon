package com.venueon.community.application.port.in;

import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.in.dto.UpdateCommunityRequest;

public interface UpdateCommunityUseCase {
    CommunityResponse updateCommunity(Long id, UpdateCommunityRequest request);
}
