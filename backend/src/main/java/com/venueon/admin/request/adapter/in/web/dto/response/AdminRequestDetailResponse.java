package com.venueon.admin.request.adapter.in.web.dto.response;

import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 어드민 요청 상세 응답 DTO
 */
@Builder
public record AdminRequestDetailResponse(
        Long id,
        Long requesterId,
        String requesterNickname,
        String requesterEmail,
        RequestCategory category,
        RequestStatus status,
        String title,
        String content,
        String attachmentUrl,
        String adminComment,
        Long processedBy,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    public static AdminRequestDetailResponse from(AdminRequest request) {
        return AdminRequestDetailResponse.builder()
                .id(request.getId())
                .requesterId(request.getRequesterId())
                .requesterNickname(request.getRequesterNickname())
                .requesterEmail(request.getRequesterEmail())
                .category(request.getCategory())
                .status(request.getStatus())
                .title(request.getTitle())
                .content(request.getContent())
                .attachmentUrl(request.getAttachmentUrl())
                .adminComment(request.getAdminComment())
                .processedBy(request.getProcessedBy())
                .createdAt(request.getCreatedAt())
                .processedAt(request.getProcessedAt())
                .build();
    }
}
