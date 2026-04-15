package com.venueon.host.profile.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 호스트 프로필 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHostProfileRequest {

    @NotBlank(message = "기관명은 필수입니다.")
    private String orgName;

    @NotBlank(message = "담당자명은 필수입니다.")
    private String managerName;

    private String orgDescription;

    /** 프로필 이미지 경로 (null이면 변경하지 않음) */
    private String profileImg;
}

