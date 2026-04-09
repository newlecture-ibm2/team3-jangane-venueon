package com.venueon.category.domain.model;

/**
 * Category 도메인 모델 (순수 POJO)
 */
public class Category {

    private Long id;
    private String name;
    private String description;
    private int sortOrder;
    private long eventCount;

    protected Category() {}

    public Category(Long id, String name, String description, int sortOrder) {
        this(id, name, description, sortOrder, 0L);
    }

    public Category(Long id, String name, String description, int sortOrder, long eventCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sortOrder = sortOrder;
        this.eventCount = eventCount;
    }

    // --- Getters ---
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getSortOrder() { return sortOrder; }
    public long getEventCount() { return eventCount; }
}
