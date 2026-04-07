package com.venueon.user.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /auth/host/upgrade 요청 DTO
 * 구글 소셜 로그인 후 호스트 정보를 보완하여 HOST로 업그레이드
 */
public record UpgradeToHostRequest(
        @NotBlank(message = "담당자명은 필수입니다.") String managerName,
        @NotBlank(message = "기관명은 필수입니다.") String orgName,
        @NotBlank(message = "사업자등록번호는 필수입니다.") String orgNumber,
        String orgDescription
) {}
