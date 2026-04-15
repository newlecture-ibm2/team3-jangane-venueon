package com.venueon.community.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CommunityType {
    HOST_AUTO("호스트 자동생성"),
    BADGE_CREATED("뱃지 보유자 생성");

    private final String description;
}
