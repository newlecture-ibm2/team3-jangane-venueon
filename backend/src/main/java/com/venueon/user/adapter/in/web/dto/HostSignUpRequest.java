package com.venueon.user.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 호스트 회원가입 요청 DTO
 */
public record HostSignUpRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다.")
        String password,

        @NotBlank(message = "담당자명은 필수입니다.")
        String managerName,

        @NotBlank(message = "기관명은 필수입니다.")
        String orgName,

        @NotBlank(message = "사업자등록번호는 필수입니다.")
        String orgNumber,

        String orgDescription
) {}
