package com.venueon.category.application.port.in;

import com.venueon.category.domain.model.Category;
import java.util.List;

public interface CategoryUseCase {
    List<Category> getAllCategories();
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    void updateSortOrder(Long id, int newOrder);
}
