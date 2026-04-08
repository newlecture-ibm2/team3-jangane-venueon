package com.venueon.user.adapter.in.web.dto;

public class MyPageSummaryResponse {
    private long ongoingCourseCount;
    private long pendingReviewCount;
    private long earnedBadgeCount;

    protected MyPageSummaryResponse() {}

    public MyPageSummaryResponse(long ongoingCourseCount, long pendingReviewCount, long earnedBadgeCount) {
        this.ongoingCourseCount = ongoingCourseCount;
        this.pendingReviewCount = pendingReviewCount;
        this.earnedBadgeCount = earnedBadgeCount;
    }

    public long getOngoingCourseCount() {
        return ongoingCourseCount;
    }

    public long getPendingReviewCount() {
        return pendingReviewCount;
    }

    public long getEarnedBadgeCount() {
        return earnedBadgeCount;
    }
}
