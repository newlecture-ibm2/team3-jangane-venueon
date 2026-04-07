package com.venueon.user.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserProfileRequest(
    @NotBlank(message = "이름(닉네임)은 필수입니다.")
    String nickname,
    String profileImg
) {}
