package com.venueon.category.adapter.out.persistence.repository;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryJpaRepository extends JpaRepository<CategoryJpaEntity, Long> {

    Optional<CategoryJpaEntity> findByName(String name);

    List<CategoryJpaEntity> findAllByOrderBySortOrderAsc();

    @Query("SELECT c, COUNT(e) FROM CategoryJpaEntity c LEFT JOIN EventJpaEntity e ON e.category = c GROUP BY c ORDER BY c.sortOrder ASC")
    List<Object[]> findAllWithEventCount();
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
}
