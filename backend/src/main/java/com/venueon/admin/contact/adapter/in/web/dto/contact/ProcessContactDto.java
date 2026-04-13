package com.venueon.admin.contact.adapter.in.web.dto.contact;

import jakarta.validation.constraints.Size;

/**
 * 어드민 요청 처리 (승인/거절) 시 코멘트 DTO
 */
public record ProcessContactDto(
        @Size(max = 500, message = "코멘트는 500자 이내로 작성해주세요.")
        String comment
) {}
