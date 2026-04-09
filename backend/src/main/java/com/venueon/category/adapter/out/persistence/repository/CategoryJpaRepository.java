package com.venueon.category.adapter.out.persistence.repository;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryJpaRepository extends JpaRepository<CategoryJpaEntity, Long> {

    Optional<CategoryJpaEntity> findByName(String name);

    List<CategoryJpaEntity> findAllByOrderBySortOrderAsc();
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
}
