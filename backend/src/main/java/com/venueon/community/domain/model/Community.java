package com.venueon.community.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class Community {
    private Long id;
    private Long eventId;
    private Long creatorId;
    private String creatorNickname;
    private String name;
    private String description;
    private String thumbnailUrl;
    private int memberCount;
    private boolean isPublic;
    private LocalDateTime createdAt;
}
