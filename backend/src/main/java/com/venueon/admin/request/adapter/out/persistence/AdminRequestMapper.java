package com.venueon.admin.request.adapter.out.persistence;

import com.venueon.admin.request.adapter.out.persistence.entity.AdminRequestJpaEntity;
import com.venueon.admin.request.domain.model.AdminRequest;
import org.springframework.stereotype.Component;

/**
 * JPA Entity ↔ Domain Model 변환 매퍼
 */
@Component
public class AdminRequestMapper {

    public AdminRequest toDomain(AdminRequestJpaEntity entity) {
        return AdminRequest.builder()
                .id(entity.getId())
                .requesterId(entity.getRequesterId())
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

    public AdminRequestJpaEntity toEntity(AdminRequest domain) {
        return AdminRequestJpaEntity.builder()
                .id(domain.getId())
                .requesterId(domain.getRequesterId())
                .category(domain.getCategory())
                .status(domain.getStatus())
                .title(domain.getTitle())
                .content(domain.getContent())
                .attachmentUrl(domain.getAttachmentUrl())
                .adminComment(domain.getAdminComment())
                .processedBy(domain.getProcessedBy())
                .createdAt(domain.getCreatedAt())
                .processedAt(domain.getProcessedAt())
                .build();
    }
}
