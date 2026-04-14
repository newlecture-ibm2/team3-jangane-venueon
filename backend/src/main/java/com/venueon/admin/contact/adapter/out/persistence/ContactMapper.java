package com.venueon.admin.contact.adapter.out.persistence;

import com.venueon.admin.contact.adapter.out.persistence.entity.ContactJpaEntity;
import com.venueon.admin.contact.domain.model.Contact;
import org.springframework.stereotype.Component;

/**
 * JPA Entity ↔ Domain Model 변환 매퍼
 */
@Component
public class ContactMapper {

    public Contact toDomain(ContactJpaEntity entity) {
        var requester = entity.getRequester();
        return Contact.builder()
                .id(entity.getId())
                .requesterId(entity.getRequesterId())
                .requesterNickname(requester != null ? requester.getNickname() : null)
                .requesterEmail(requester != null ? requester.getEmail() : null)
                .requesterProfileImg(requester != null ? requester.getProfileImg() : null)
                .category(entity.getCategory())
                .status(entity.getStatus())
                .title(entity.getTitle())
                .content(entity.getContent())
                .attachmentUrl(entity.getAttachmentUrl())
                .adminComment(entity.getAdminComment())
                .processedBy(entity.getProcessedBy())
                .createdAt(entity.getCreatedAt())
                .processedAt(entity.getProcessedAt())
                .build();
    }

    public ContactJpaEntity toEntity(Contact domain) {
        return ContactJpaEntity.builder()
                .id(domain.getId())
                .requesterId(domain.getRequesterId())
                .category(domain.getCategory())
                .status(domain.getStatus())
                .title(domain.getTitle())
                .content(domain.getContent())
                .attachmentUrl(domain.getAttachmentUrl())
                .adminComment(domain.getAdminComment())
                .processedBy(domain.getProcessedBy())
                .createdAt(domain.getCreatedAt() != null ? domain.getCreatedAt() : java.time.LocalDateTime.now())
                .processedAt(domain.getProcessedAt())
                .build();
    }
}
