package com.venueon.event.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * 세션 수정 요청 DTO
 * v6: price 제거, regionSido/regionSigungu/recruitStartDate/recruitEndDate 추가
 */
public record SessionUpdateRequest(
    @NotBlank(message = "세션 제목은 필수입니다.") String title,
    String description,
    int sortOrder,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    String regionSido,
    String regionSigungu,
    boolean isOnline,
    String onlineLink,
    int maxAttendees,
    LocalDateTime recruitStartDate,
    LocalDateTime recruitEndDate
) {}
