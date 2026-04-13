package com.venueon.admin.contact.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 어드민 요청 도메인 모델
 */
@Getter
@Builder
@AllArgsConstructor
public class Contact {

    private Long id;
    private Long requesterId;
    private String requesterNickname;
    private String requesterEmail;
    private ContactCategory category;
    private ContactStatus status;
    private String title;
    private String content;
    private String attachmentUrl;
    private String adminComment;
    private Long processedBy;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    /**
     * 검토 중 처리
     */
    public void markAsReviewing() {
        if (this.status == ContactStatus.PENDING) {
            this.status = ContactStatus.REVIEWING;
        }
    }

    /**
     * 요청을 처리 완료(승인/답변) 처리
     */
    public void approve(Long adminId, String comment) {
        this.status = ContactStatus.COMPLETED;
        this.processedBy = adminId;
        this.adminComment = comment;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * 요청을 거절 처리
     */
    public void reject(Long adminId, String comment) {
        this.status = ContactStatus.REJECTED;
        this.processedBy = adminId;
        this.adminComment = comment;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * 처리 대기 중인지 확인
     */
    public boolean isPending() {
        return this.status == ContactStatus.PENDING;
    }

    /**
     * 사용자가 요청 취소
     */
    public void cancel() {
        if (this.status != ContactStatus.PENDING && this.status != ContactStatus.REVIEWING) {
            throw new IllegalStateException("대기 중 또는 검토 중 상태에서만 취소할 수 있습니다.");
        }
        this.status = ContactStatus.CANCELLED;
        this.processedAt = LocalDateTime.now();
    }
}
