package com.venueon.post.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class Post {

    private Long id;
    private Long communityId;
    private Long authorId;
    private String authorNickname;
    private String authorProfileImg;
    private String title;
    private String content;
    private PostType type;
    private int viewCount;
    private int commentCount;
    private int likeCount;
    private boolean isPinned;
    private boolean isNotice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Post() {}

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

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void togglePin() {
        this.isPinned = !this.isPinned;
    }

}
