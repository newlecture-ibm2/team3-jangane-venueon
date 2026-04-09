package com.venueon.category.adapter.out.persistence;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository;
import com.venueon.category.application.port.out.CategoryPort;
import com.venueon.category.domain.model.Category;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CategoryPersistenceAdapter implements CategoryPort {

    private final CategoryJpaRepository categoryRepository;
    private final EventJpaRepository eventRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> findAllOrderBySortOrder() {
        return findAllWithEventCount();
    }

    @Override
    public List<Category> findAllWithEventCount() {
        return categoryRepository.findAllWithEventCount().stream()
                .map(result -> categoryMapper.toDomain(
                    (CategoryJpaEntity) result[0],
                    (Long) result[1]
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Category save(Category category) {
        CategoryJpaEntity entity = categoryMapper.toEntity(category);
        CategoryJpaEntity saved = categoryRepository.save(entity);
        return categoryMapper.toDomain(saved);
    }

    @Override
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id).map(categoryMapper::toDomain);
    }

    @Override
    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }

    @Override
    public boolean existsByNameAndIdNot(String name, Long id) {
        return categoryRepository.existsByNameAndIdNot(name, id);
    }

    @Override
    public boolean isCategoryInUse(Long id) {
        return eventRepository.existsByCategoryId(id);
    }
}
