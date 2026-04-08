package com.venueon.user.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.user.application.port.in.UpdateUserPasswordUseCase;
import com.venueon.user.application.port.in.UpdateUserProfileUseCase;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.venueon.user.application.port.in.DeactivateUserUseCase;

@Slf4j
@UseCase
@RequiredArgsConstructor
public class UserService implements UpdateUserProfileUseCase, UpdateUserPasswordUseCase, DeactivateUserUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User updateProfile(String email, String nickname, String profileImg, java.util.List<String> categories, Boolean showBadge) {
        log.debug("프로필 수정 시작: email={}, nickname={}", email, nickname);

        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        // User 도메인의 비즈니스 메서드 호출
        user.updateProfile(nickname, profileImg, categories, showBadge);

        // 포트를 통해 DB 갱신
        User savedUser = userRepositoryPort.save(user);

        log.info("프로필 수정 완료: email={}", email);
        return savedUser;
    }

    @Override
    public void updatePassword(String email, String currentPassword, String newPassword) {
        log.debug("비밀번호 수정 시작: email={}", email);

        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "현재 비밀번호가 일치하지 않습니다.");
        }

        user.updatePassword(passwordEncoder.encode(newPassword));
        userRepositoryPort.save(user);

        log.info("비밀번호 수정 완료: email={}", email);
    }

    @Override
    public void deactivateUser(String email) {
        log.debug("계정 탈퇴 처리 시작: email={}", email);

        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        user.deactivate();
        userRepositoryPort.save(user);

        log.info("계정 탈퇴 완료: email={}", email);
    }
}
