package com.venueon.admin.category.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
    @NotBlank(message = "Category name is required")
    String name,
    String description,
    int sortOrder
) {}
