package com.venueon.community.application.port.in;

import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.in.dto.CreateCommunityRequest;

public interface CreateCommunityUseCase {
    CommunityResponse createCommunity(CreateCommunityRequest request, String email);
}
