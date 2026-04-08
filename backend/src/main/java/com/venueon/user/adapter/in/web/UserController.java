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

import com.venueon.user.application.port.in.DeactivateUserUseCase;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UpdateUserProfileUseCase updateUserProfileUseCase;
    private final UpdateUserPasswordUseCase updateUserPasswordUseCase;
    private final DeactivateUserUseCase deactivateUserUseCase;

    /**
     * PUT /api/users/me/profile — 내 프로필(이름, 사진, 카테고리, 뱃지) 수정
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
                request.profileImg(),
                request.categories(),
                request.showBadge()
        );

        UserInfoResponse response = new UserInfoResponse(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getNickname(),
                updatedUser.getRole().name(),
                updatedUser.getProfileImg(),
                updatedUser.getCategories(),
                updatedUser.isBadgeVisible()
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PUT /api/users/me/password — 내 계정 비밀번호 변경
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

    /**
     * DELETE /api/users/me — 내 계정 탈퇴
     */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount(Authentication authentication) {
        String email = authentication.getName();
        log.debug("계정 탈퇴 요청: email={}", email);

        deactivateUserUseCase.deactivateUser(email);

        return ResponseEntity.ok(ApiResponse.success());
    }
}
