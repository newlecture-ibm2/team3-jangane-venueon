package com.venueon.host.event.adapter.in.web.dto;

import java.time.LocalDateTime;

/**
 * 호스트 전용 수강생 명단 응답 DTO
 */
public record AttendeeResponse(
        Long id,
        String userName,
        String email,
        String phone,
        String sessionTitle,
        int paidAmount,
        String status,
        LocalDateTime createdAt
) {}
