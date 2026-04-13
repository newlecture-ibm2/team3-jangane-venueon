package com.venueon.category.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

public record CategoryRequest(
    @NotBlank(message = "Category name is required")
    String name,
    String description,
    int sortOrder
) {}
