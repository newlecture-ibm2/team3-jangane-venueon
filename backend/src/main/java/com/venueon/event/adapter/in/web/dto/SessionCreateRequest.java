package com.venueon.event.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record SessionCreateRequest(
    @NotBlank(message = "세션 제목은 필수입니다.") String title,
    String description,
    int sortOrder,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    boolean isOnline,
    String onlineLink,
    int price,
    int maxAttendees
) {}
