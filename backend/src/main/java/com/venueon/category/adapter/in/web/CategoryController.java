package com.venueon.category.adapter.in.web;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryJpaRepository categoryJpaRepository;

    @GetMapping
    public ResponseEntity<?> getCategories() {
        List<CategoryJpaEntity> entities = categoryJpaRepository.findAllByOrderBySortOrderAsc();
        List<Map<String, Object>> categoryList = entities.stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", e.getId());
                    map.put("name", e.getName());
                    return map;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", categoryList);
        return ResponseEntity.ok(response);
    }

}
