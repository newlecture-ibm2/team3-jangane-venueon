package com.venueon.category.application.port.out;

import com.venueon.category.domain.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryPort {
    List<Category> findAllOrderBySortOrder();
    Category save(Category category);
    Optional<Category> findById(Long id);
    void delete(Long id);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    boolean isCategoryInUse(Long id); // Check if category is used by other entities
}
