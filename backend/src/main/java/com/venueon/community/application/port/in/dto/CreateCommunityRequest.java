package com.venueon.community.application.port.in.dto;

public record CreateCommunityRequest(
        Long eventId,
        String name,
        String description,
        Boolean isPublic
) {
}
