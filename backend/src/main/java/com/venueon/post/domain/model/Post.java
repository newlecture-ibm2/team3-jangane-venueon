package com.venueon.post.domain.model;

import java.time.LocalDateTime;

/**
 * Post(게시글) 도메인 모델 (순수 POJO)
 */
public class Post {

    private Long id;
    private Long communityId;
    private Long authorId;
    private String title;
    private String content;
    private PostType type;
    private int viewCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Post() {}

    public Post(Long id, Long communityId, Long authorId, String title, String content,
                PostType type, int viewCount, int commentCount,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.communityId = communityId;
        this.authorId = authorId;
        this.title = title;
        this.content = content;
        this.type = type;
        this.viewCount = viewCount;
        this.commentCount = commentCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- 비즈니스 행위 ---

    public boolean isOwnedBy(Long userId) {
        return this.authorId != null && this.authorId.equals(userId);
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementCommentCount() {
        this.commentCount++;
    }

    public void decrementCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getCommunityId() { return communityId; }
    public Long getAuthorId() { return authorId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public PostType getType() { return type; }
    public int getViewCount() { return viewCount; }
    public int getCommentCount() { return commentCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
