package com.venueon.admin.request.adapter.in.web.dto.response;

import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 어드민 요청 목록 응답 DTO
 */
@Builder
public record AdminRequestListResponse(
        Long id,
        Long requesterId,
        String requesterNickname,
        String requesterEmail,
        RequestCategory category,
        RequestStatus status,
        String title,
        boolean hasAttachment,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    public static AdminRequestListResponse from(AdminRequest request) {
        return AdminRequestListResponse.builder()
                .id(request.getId())
                .requesterId(request.getRequesterId())
                .requesterNickname(request.getRequesterNickname())
                .requesterEmail(request.getRequesterEmail())
                .category(request.getCategory())
                .status(request.getStatus())
                .title(request.getTitle())
                .hasAttachment(request.getAttachmentUrl() != null && !request.getAttachmentUrl().isBlank())
                .createdAt(request.getCreatedAt())
                .processedAt(request.getProcessedAt())
                .build();
    }
}
