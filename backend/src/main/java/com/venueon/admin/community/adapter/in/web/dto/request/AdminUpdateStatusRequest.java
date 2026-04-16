package com.venueon.admin.community.adapter.in.web.dto.request;

import com.venueon.admin.community.domain.model.ContentStatus;
import jakarta.validation.constraints.NotNull;

/**
 * 게시글/댓글 상태 변경 요청 DTO
 */
public record AdminUpdateStatusRequest(
        @NotNull(message = "상태값은 필수입니다.")
        ContentStatus status
) {
}
