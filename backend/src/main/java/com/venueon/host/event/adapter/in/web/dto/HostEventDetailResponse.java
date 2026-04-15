package com.venueon.host.event.adapter.in.web.dto;

import com.venueon.common.dto.CodeDto;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 호스트 전용 강의 상세 응답 DTO
 */
public record HostEventDetailResponse(
        Long id,
        String title,
        String description,
        String thumbnailUrl,
        CodeDto category,
        CodeDto status,
        LocalDateTime createdAt,
        Long totalRevenue,
        Long totalAttendees,
        List<SessionDetail> sessions
) {
    public record SessionDetail(
            Long id,
            String title,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String location,
            int maxAttendees,
            int currentAttendees,
            CodeDto status
    ) {}
}
