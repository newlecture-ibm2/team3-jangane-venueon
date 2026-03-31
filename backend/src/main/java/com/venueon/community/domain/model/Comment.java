package com.venueon.community.domain.model;

import java.time.LocalDateTime;

/**
 * Comment(댓글) 도메인 모델 (순수 POJO)
 * 대댓글 구조 지원 (parentId)
 */
public class Comment {

    private Long id;
    private Long postId;
    private Long authorId;
    private Long parentId;  // 대댓글 시 부모 댓글 ID
    private String content;
    private LocalDateTime createdAt;

    protected Comment() {}

    public Comment(Long id, Long postId, Long authorId, Long parentId,
                   String content, LocalDateTime createdAt) {
        this.id = id;
        this.postId = postId;
        this.authorId = authorId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
    }

    // --- 비즈니스 행위 ---

    public boolean isReply() {
        return this.parentId != null;
    }

    public boolean isOwnedBy(Long userId) {
        return this.authorId != null && this.authorId.equals(userId);
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public Long getAuthorId() { return authorId; }
    public Long getParentId() { return parentId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
