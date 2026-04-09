package com.venueon.category.application.service;

import com.venueon.category.application.port.in.CategoryUseCase;
import com.venueon.category.application.port.out.CategoryPort;
import com.venueon.category.domain.model.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService implements CategoryUseCase {

    private final CategoryPort categoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryPort.findAllOrderBySortOrder();
    }

    @Override
    public Category createCategory(Category category) {
        if (categoryPort.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + category.getName());
        }
        return categoryPort.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category category) {
        if (!categoryPort.findById(id).isPresent()) {
            throw new IllegalArgumentException("Category not found with id: " + id);
        }
        if (categoryPort.existsByNameAndIdNot(category.getName(), id)) {
            throw new IllegalArgumentException("Category name already exists: " + category.getName());
        }
        
        Category updatedCategory = new Category(
            id,
            category.getName(),
            category.getDescription(),
            category.getSortOrder()
        );
        return categoryPort.save(updatedCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        if (categoryPort.isCategoryInUse(id)) {
            throw new IllegalStateException("Category is currently in use and cannot be deleted.");
        }
        categoryPort.delete(id);
    }

    @Override
    public void updateSortOrder(Long id, int newOrder) {
        Category category = categoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        Category updated = new Category(
            category.getId(),
            category.getName(),
            category.getDescription(),
            newOrder
        );
        categoryPort.save(updated);
    }
}
