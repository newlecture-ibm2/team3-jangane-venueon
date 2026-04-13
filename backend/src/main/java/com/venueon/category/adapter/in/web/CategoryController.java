package com.venueon.category.adapter.in.web;

import com.venueon.admin.category.adapter.in.web.dto.CategoryResponse;
import com.venueon.category.application.port.in.CategoryUseCase;
import com.venueon.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 공개 API — 누구나 접근 가능
 * 이벤트 생성 폼, 메인페이지 필터 등에서 사용
 */
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryUseCase categoryUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        List<CategoryResponse> responses = categoryUseCase.getAllCategories().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getSortOrder(), c.getEventCount()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

