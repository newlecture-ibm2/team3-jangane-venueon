package com.venueon.admin.category.adapter.in.web;

import com.venueon.admin.category.adapter.in.web.dto.CategoryRequest;
import com.venueon.admin.category.adapter.in.web.dto.CategoryResponse;
import com.venueon.admin.category.adapter.in.web.dto.UpdateOrderRequest;
import com.venueon.category.application.port.in.CategoryUseCase;
import com.venueon.category.domain.model.Category;
import com.venueon.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryUseCase categoryUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        List<CategoryResponse> responses = categoryUseCase.getAllCategories().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getSortOrder(), c.getEventCount()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = new Category(null, request.name(), request.description(), request.sortOrder());
        Category saved = categoryUseCase.createCategory(category);
        CategoryResponse response = new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.getSortOrder(), saved.getEventCount());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        Category category = new Category(id, request.name(), request.description(), request.sortOrder());
        Category updated = categoryUseCase.updateCategory(id, category);
        CategoryResponse response = new CategoryResponse(updated.getId(), updated.getName(), updated.getDescription(), updated.getSortOrder(), updated.getEventCount());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryUseCase.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PatchMapping("/{id}/order")
    public ResponseEntity<ApiResponse<Void>> updateOrder(
            @PathVariable Long id,
            @RequestBody UpdateOrderRequest request) {
        categoryUseCase.updateSortOrder(id, request.sortOrder());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
