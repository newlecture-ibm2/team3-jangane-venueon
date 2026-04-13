package com.venueon.post.application.port.in.dto;

public record UpdatePostRequest(
        String title,
        String content,
        String type
) {
}
