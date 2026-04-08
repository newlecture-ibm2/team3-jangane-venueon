package com.venueon.user.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.user.adapter.in.web.dto.UpdateUserProfileRequest;
import com.venueon.user.adapter.in.web.dto.UserInfoResponse;
import com.venueon.user.application.port.in.UpdateUserPasswordUseCase;
import com.venueon.user.application.port.in.UpdateUserProfileUseCase;
import com.venueon.user.domain.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UpdateUserProfileUseCase updateUserProfileUseCase;
    private final UpdateUserPasswordUseCase updateUserPasswordUseCase;

    /**
     * PUT /api/v1/users/me/profile — 내 프로필(이름, 사진) 수정
     */
    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse<UserInfoResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        
        String email = authentication.getName();
        log.debug("프로필 수정 API 요청: email={}", email);

        User updatedUser = updateUserProfileUseCase.updateProfile(
                email,
                request.nickname(),
                request.profileImg()
        );

        UserInfoResponse response = new UserInfoResponse(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getNickname(),
                updatedUser.getRole().name(),
                updatedUser.getProfileImg()
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PUT /api/v1/users/me/password — 내 계정 비밀번호 변경
     */
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            Authentication authentication,
            @Valid @RequestBody com.venueon.user.adapter.in.web.dto.UpdatePasswordRequest request) {

        String email = authentication.getName();
        log.debug("비밀번호 변경 API 요청: email={}", email);

        updateUserPasswordUseCase.updatePassword(
                email,
                request.currentPassword(),
                request.newPassword()
        );

        return ResponseEntity.ok(ApiResponse.success());
    }
}
