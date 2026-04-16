package com.venueon.admin.community.adapter.in.web.dto.response;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import lombok.Builder;

/**
 * 어드민 커뮤니티(게시판) 목록 조회 응답 DTO
 */
@Builder
public record AdminCommunityListResponse(
    Long id,
    String name,
    String description,
    String creatorNickname,
    String eventName,
    String createdAt
) {
    public static AdminCommunityListResponse from(CommunityJpaEntity entity) {
        String displayName = entity.getName();
        String eventTitle = null;
        
        if (entity.getEvent() != null) {
            eventTitle = entity.getEvent().getTitle();
            // 강의 커뮤니티인 경우 강의 제목을 우선적으로 표시할 수도 있음
            if (displayName == null || displayName.isEmpty()) {
                displayName = eventTitle + " 커뮤니티";
            }
        }

        return AdminCommunityListResponse.builder()
            .id(entity.getId())
            .name(displayName)
            .description(entity.getDescription())
            .creatorNickname(entity.getCreator() != null ? entity.getCreator().getNickname() : "시스템")
            .eventName(eventTitle)
            .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : "")
            .build();
    }
}
