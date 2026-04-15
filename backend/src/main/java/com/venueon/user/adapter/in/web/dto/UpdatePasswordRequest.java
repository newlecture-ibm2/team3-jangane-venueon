package com.venueon.user.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePasswordRequest(
    String currentPassword,
    
    @NotBlank(message = "새 비밀번호는 필수입니다.")
    String newPassword
) {}
