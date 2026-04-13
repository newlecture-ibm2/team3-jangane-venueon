package com.venueon.admin.contact.adapter.in.web.dto.response;

import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 어드민 요청 목록 응답 DTO
 */
@Builder
public record ContactListResponse(
        Long id,
        Long requesterId,
        String requesterNickname,
        String requesterEmail,
        ContactCategory category,
        ContactStatus status,
        String title,
        boolean hasAttachment,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    public static ContactListResponse from(Contact contact) {
        return ContactListResponse.builder()
                .id(contact.getId())
                .requesterId(contact.getRequesterId())
                .requesterNickname(contact.getRequesterNickname())
                .requesterEmail(contact.getRequesterEmail())
                .category(contact.getCategory())
                .status(contact.getStatus())
                .title(contact.getTitle())
                .hasAttachment(contact.getAttachmentUrl() != null && !contact.getAttachmentUrl().isBlank())
                .createdAt(contact.getCreatedAt())
                .processedAt(contact.getProcessedAt())
                .build();
    }
}
