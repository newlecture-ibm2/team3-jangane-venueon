package com.venueon.user.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.user.adapter.in.web.dto.*;
import com.venueon.user.application.port.in.*;
import com.venueon.user.domain.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * /auth/signup, /auth/host/signup, /auth/login, /auth/google, /auth/me 엔드포인트
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SignUpUseCase signUpUseCase;
    private final HostSignUpUseCase hostSignUpUseCase;
    private final LoginUseCase loginUseCase;
    private final GoogleLoginUseCase googleLoginUseCase;
    private final GetUserInfoUseCase getUserInfoUseCase;
    private final UpgradeToHostUseCase upgradeToHostUseCase;

    /**
     * POST /auth/signup — 일반 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserInfoResponse>> signUp(@Valid @RequestBody SignUpRequest request) {
        log.debug("회원가입 요청: email={}", request.email());

        User user = signUpUseCase.signUp(
                request.email(),
                request.password(),
                request.nickname(),
                request.role()
        );

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getProfileImg()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * POST /auth/host/signup — 호스트 회원가입
     */
    @PostMapping("/host/signup")
    public ResponseEntity<ApiResponse<UserInfoResponse>> hostSignUp(@Valid @RequestBody HostSignUpRequest request) {
        log.debug("호스트 회원가입 요청: email={}, orgName={}", request.email(), request.orgName());

        User user = hostSignUpUseCase.hostSignUp(
                request.email(),
                request.password(),
                request.managerName(),
                request.orgName(),
                request.orgNumber(),
                request.orgDescription()
        );

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getProfileImg()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * POST /auth/login — 로그인 (JWT 발급)
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.debug("로그인 요청: email={}", request.email());

        LoginUseCase.LoginResult result = loginUseCase.login(request.email(), request.password());

        LoginResponse response = new LoginResponse(
                result.token(),
                result.email(),
                result.nickname(),
                result.role()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * POST /auth/google — 구글 소셜 로그인 (Google ID Token → JWT 발급)
     */
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        log.debug("구글 소셜 로그인 요청");

        LoginUseCase.LoginResult result = googleLoginUseCase.googleLogin(request.idToken());

        LoginResponse response = new LoginResponse(
                result.token(),
                result.email(),
                result.nickname(),
                result.role()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * POST /auth/host/upgrade — 호스트 업그레이드 (JWT 인증 필요)
     * 구글 소셜 로그인으로 가입한 USER가 호스트 정보를 추가하여 HOST로 전환
     */
    @PostMapping("/host/upgrade")
    public ResponseEntity<ApiResponse<UserInfoResponse>> upgradeToHost(
            Authentication authentication,
            @Valid @RequestBody UpgradeToHostRequest request) {
        String email = authentication.getName();
        log.debug("호스트 업그레이드 요청: email={}", email);

        User user = upgradeToHostUseCase.upgradeToHost(
                email,
                request.managerName(),
                request.orgName(),
                request.orgNumber(),
                request.orgDescription()
        );

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getProfileImg()
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /auth/me — 사용자 정보 조회 (JWT 필요)
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me(Authentication authentication) {
        String email = authentication.getName();
        log.debug("/auth/me 요청: email={}", email);

        User user = getUserInfoUseCase.getUserByEmail(email);

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getProfileImg()
        );

        return ResponseEntity.ok(response);
    }
}
