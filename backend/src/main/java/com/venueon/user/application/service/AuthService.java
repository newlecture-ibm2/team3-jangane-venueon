package com.venueon.user.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.user.adapter.in.security.JwtTokenProvider;
import com.venueon.user.application.port.in.GetUserInfoUseCase;
import com.venueon.user.application.port.in.LoginUseCase;
import com.venueon.user.application.port.in.SignUpUseCase;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 회원가입/로그인 비즈니스 로직
 * - BCrypt 비밀번호 암호화
 * - 이메일 중복 체크
 * - JWT 발급 위임
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class AuthService implements SignUpUseCase, LoginUseCase, GetUserInfoUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public User signUp(String email, String password, String nickname, String role) {
        log.debug("회원가입 시도: email={}", email);

        // 이메일 중복 체크
        if (userRepositoryPort.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        // 역할 변환
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "유효하지 않은 역할입니다: " + role);
        }

        // 도메인 모델 생성 및 저장
        User user = new User(null, email, encodedPassword, nickname, userRole,
                null, null, null, null, null, null, null);
        User savedUser = userRepositoryPort.save(user);

        log.info("회원가입 완료: email={}, role={}", email, userRole);
        return savedUser;
    }

    @Override
    public LoginResult login(String email, String password) {
        log.debug("로그인 시도: email={}", email);

        // 사용자 조회
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // JWT 토큰 생성
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        log.info("로그인 성공: email={}", email);
        return new LoginResult(token, user.getEmail(), user.getNickname(), user.getRole().name());
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
    }
}
