package com.venueon.community.application.port.in.dto;

public record UpdateCommunityRequest(
        String name,
        String description,
        Boolean isPublic
) {
}
