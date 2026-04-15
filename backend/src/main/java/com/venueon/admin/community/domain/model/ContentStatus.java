package com.venueon.admin.community.domain.model;

/**
 * 어드민 커뮤니티 콘텐츠 상태
 * - ACTIVE : 정상 (공개)
 * - HIDDEN : 숨김 (사용자에게 비노출, 복구 가능)
 * - DELETED: 삭제 (소프트 삭제)
 */
public enum ContentStatus {
    ACTIVE,
    HIDDEN,
    DELETED
}
