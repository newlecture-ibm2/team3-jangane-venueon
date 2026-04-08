package com.venueon.comment.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    private Long id;
    private Long postId;
    private Long authorId;
    private String authorNickname; // UI 표현용
    private Long parentId;  // 대댓글 시 부모 댓글 ID
    private String content;
    private int likeCount;
    private LocalDateTime createdAt;

    // --- 비즈니스 행위 ---
    public boolean isReply() {
        return this.parentId != null;
    }

    public boolean isOwnedBy(Long userId) {
        return this.authorId != null && this.authorId.equals(userId);
    }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}
