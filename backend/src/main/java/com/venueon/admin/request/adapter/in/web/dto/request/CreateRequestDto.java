package com.venueon.admin.request.adapter.in.web.dto.request;

import com.venueon.admin.request.domain.model.RequestCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 사용자/호스트 요청 작성 DTO
 */
public record CreateRequestDto(
        @NotNull(message = "카테고리를 선택해주세요.")
        RequestCategory category,

        @NotBlank(message = "제목을 입력해주세요.")
        @Size(max = 200, message = "제목은 200자 이내로 작성해주세요.")
        String title,

        @NotBlank(message = "내용을 입력해주세요.")
        @Size(max = 3000, message = "내용은 3000자 이내로 작성해주세요.")
        String content,

        String attachmentUrl
) {}
