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
    private boolean isHidden;
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
        if (this.isNotice) {
            return; // 공지사항은 고정 해제 불가능
        }
        this.isPinned = !this.isPinned;
    }

    public void toggleNotice() {
        this.isNotice = !this.isNotice;
        this.type = this.isNotice ? PostType.NOTICE : PostType.GENERAL;
        if (this.isNotice) {
            this.isPinned = true;
        } else {
            this.isPinned = false; // 공지 해제 시 고정도 함께 해제
        }
    }

    public void update(String title, String content, String type) {
        if (title != null && !title.isBlank()) {
            this.title = title;
        }
        if (content != null && !content.isBlank()) {
            this.content = content;
        }
        if (type != null && !type.isBlank()) {
            try {
                this.type = PostType.valueOf(type);
            } catch (IllegalArgumentException e) {
                // Ignore invalid type
            }
        }
        this.updatedAt = LocalDateTime.now();
    public void hide() {
        this.isHidden = true;
    }
}
