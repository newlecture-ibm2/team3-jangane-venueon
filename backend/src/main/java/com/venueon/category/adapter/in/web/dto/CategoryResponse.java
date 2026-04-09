package com.venueon.category.adapter.in.web.dto;

public record CategoryResponse(
    Long id,
    String name,
    String description,
    int sortOrder,
    long eventCount
) {}
