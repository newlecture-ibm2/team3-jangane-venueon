package com.venueon.admin.contact.adapter.in.web.dto.response;

import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 어드민 요청 상세 응답 DTO
 */
@Builder
public record ContactDetailResponse(
        Long id,
        Long requesterId,
        String requesterNickname,
        String requesterEmail,
        ContactCategory category,
        ContactStatus status,
        String title,
        String content,
        String attachmentUrl,
        String adminComment,
        Long processedBy,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    public static ContactDetailResponse from(Contact contact) {
        return ContactDetailResponse.builder()
                .id(contact.getId())
                .requesterId(contact.getRequesterId())
                .requesterNickname(contact.getRequesterNickname())
                .requesterEmail(contact.getRequesterEmail())
                .category(contact.getCategory())
                .status(contact.getStatus())
                .title(contact.getTitle())
                .content(contact.getContent())
                .attachmentUrl(contact.getAttachmentUrl())
                .adminComment(contact.getAdminComment())
                .processedBy(contact.getProcessedBy())
                .createdAt(contact.getCreatedAt())
                .processedAt(contact.getProcessedAt())
                .build();
    }
}
