package com.venueon.category.adapter.out.persistence;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.category.domain.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toDomain(CategoryJpaEntity entity) {
        return toDomain(entity, 0L);
    }

    public Category toDomain(CategoryJpaEntity entity, long eventCount) {
        if (entity == null) return null;
        return new Category(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getSortOrder(),
            eventCount
        );
    }

    public CategoryJpaEntity toEntity(Category domain) {
        if (domain == null) return null;
        return CategoryJpaEntity.builder()
            .id(domain.getId())
            .name(domain.getName())
            .description(domain.getDescription())
            .sortOrder(domain.getSortOrder())
            .build();
    }
}
