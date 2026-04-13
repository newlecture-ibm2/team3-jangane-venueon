package com.venueon.user.application.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.user.adapter.in.security.JwtTokenProvider;
import com.venueon.user.application.port.in.*;
import com.venueon.user.application.port.out.HostProfileRepositoryPort;
import com.venueon.user.application.port.out.UserRepositoryPort;

import com.venueon.user.domain.model.AuthProvider;
import com.venueon.user.domain.model.HostProfile;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

/**
 * 회원가입/로그인 비즈니스 로직
 * - BCrypt 비밀번호 암호화
 * - 이메일 중복 체크
 * - JWT 발급 위임
 * - 호스트 가입 시 HostProfile 분리 저장
 * - 구글 소셜 로그인 (ID Token 검증 + 자동 가입)
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class AuthService implements SignUpUseCase, HostSignUpUseCase, LoginUseCase, GetUserInfoUseCase,
        GoogleLoginUseCase, UpgradeToHostUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final HostProfileRepositoryPort hostProfileRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;


    @Value("${google.client-id:}")
    private String googleClientId;

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
        Long roleId;
        String roleLabel;
        try {
            if ("HOST".equalsIgnoreCase(role)) { roleId = com.venueon.common.model.CodeConstants.ROLE_HOST_ID; roleLabel = "호스트"; }
            else if ("ADMIN".equalsIgnoreCase(role)) { roleId = com.venueon.common.model.CodeConstants.ROLE_ADMIN_ID; roleLabel = "관리자"; }
            else { roleId = com.venueon.common.model.CodeConstants.ROLE_USER_ID; roleLabel = "일반회원"; }
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "유효하지 않은 역할입니다: " + role);
        }

        com.venueon.common.model.DomainCode userRole = com.venueon.common.model.DomainCode.of(roleId, roleLabel);

        // 도메인 모델 생성 및 저장
        User user = new User(null, email, encodedPassword, nickname, userRole,
                AuthProvider.LOCAL, null, null, true, null, null);
        User savedUser = userRepositoryPort.save(user);

        log.info("회원가입 완료: email={}, role={}", email, roleLabel);
        return savedUser;
    }

    @Override
    public User hostSignUp(String email, String password, String managerName,
            String orgName, String orgNumber, String orgDescription) {
        log.debug("호스트 회원가입 시도: email={}", email);

        // 이메일 중복 체크
        if (userRepositoryPort.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        // User 저장 (role=HOST)
        com.venueon.common.model.DomainCode hostRole = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.ROLE_HOST_ID, "호스트");
        User user = new User(null, email, encodedPassword, managerName, hostRole,
                AuthProvider.LOCAL, null, null, true, null, null);
        User savedUser = userRepositoryPort.save(user);

        // HostProfile 저장
        HostProfile hostProfile = new HostProfile(
                null, savedUser.getId(), orgName, orgNumber,
                managerName, orgDescription, null, null);
        hostProfileRepositoryPort.save(hostProfile);



        log.info("호스트 회원가입 완료: email={}, orgName={}", email, orgName);
        return savedUser;
    }

    @Override
    public LoginResult login(String email, String password) {
        log.debug("로그인 시도: email={}", email);

        // 사용자 조회
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));

        // 탈퇴한 사용자 체크
        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "탈퇴 처리된 계정입니다.");
        }

        // 구글 소셜 계정은 비밀번호 로그인 불가
        if (user.isGoogleUser()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "구글 소셜 로그인으로 가입된 계정입니다. 구글 로그인을 이용해 주세요.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // JWT 토큰 생성 (Security 계층과 일관되게 code 문자열 사용)
        String roleCode = resolveRoleCode(user.getRole().id());
        String token = jwtTokenProvider.generateToken(user.getEmail(), roleCode);

        log.info("로그인 성공: email={}", email);
        return new LoginResult(token, user.getEmail(), user.getNickname(), com.venueon.common.dto.CodeDto.of(user.getRole().id(), user.getRole().label()));
    }

    @Override
    public LoginResult googleLogin(String idTokenString) {
        log.debug("구글 소셜 로그인 시도");

        // 1. Google ID Token 검증
        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        log.debug("구글 토큰 검증 완료: email={}, name={}", email, name);

        // 2. 기존 회원 조회 or 자동 가입
        Optional<User> existingUser = userRepositoryPort.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();

            if (!user.isActive()) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "탈퇴 처리된 계정입니다.");
            }

            log.info("구글 로그인 - 기존 회원: email={}", email);
        } else {
            // 소셜 로그인 사용자는 랜덤 비밀번호 (비밀번호 로그인 불가)
            String randomPassword = passwordEncoder.encode(UUID.randomUUID().toString());
            String nickname = (name != null && !name.isBlank()) ? name : email.split("@")[0];

            com.venueon.common.model.DomainCode userRole = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.ROLE_USER_ID, "일반회원");
            user = new User(null, email, randomPassword, nickname, userRole,
                    AuthProvider.GOOGLE, picture, null, true, null, null);
            user = userRepositoryPort.save(user);

            log.info("구글 로그인 - 자동 가입 완료: email={}, nickname={}", email, nickname);
        }

        // 3. JWT 발급
        String roleCode = resolveRoleCode(user.getRole().id());
        String token = jwtTokenProvider.generateToken(user.getEmail(), roleCode);

        return new LoginResult(token, user.getEmail(), user.getNickname(), com.venueon.common.dto.CodeDto.of(user.getRole().id(), user.getRole().label()));
    }

    @Override
    public User upgradeToHost(String email, String managerName,
            String orgName, String orgNumber, String orgDescription) {
        log.debug("호스트 업그레이드 시도: email={}", email);

        // 사용자 조회
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        // 이미 HOST인 경우
        if (user.getRole() != null && user.getRole().id().equals(com.venueon.common.model.CodeConstants.ROLE_HOST_ID)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 호스트로 등록된 계정입니다.");
        }

        // role 업그레이드: USER → HOST
        com.venueon.common.model.DomainCode hostRole = com.venueon.common.model.DomainCode.of(com.venueon.common.model.CodeConstants.ROLE_HOST_ID, "호스트");
        User upgradedUser = new User(
                user.getId(), user.getEmail(), user.getPassword(), managerName,
                hostRole, user.getProvider(),
                user.getProfileImg(), user.getPhone(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
        User savedUser = userRepositoryPort.save(upgradedUser);

        // HostProfile 생성
        HostProfile hostProfile = new HostProfile(
                null, savedUser.getId(), orgName, orgNumber,
                managerName, orgDescription != null ? orgDescription : "", null, null);
        hostProfileRepositoryPort.save(hostProfile);



        log.info("호스트 업그레이드 완료: email={}, orgName={}", email, orgName);
        return savedUser;
    }

    @Override
    public User getUserByEmail(String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "탈퇴 처리된 사용자입니다.");
        }

        return user;
    }

    /**
     * Google ID Token 검증
     */
    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "유효하지 않은 구글 토큰입니다.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            // 이메일 인증 여부 확인
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 인증이 완료되지 않은 구글 계정입니다.");
            }

            return payload;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("구글 토큰 검증 실패", e);
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "구글 토큰 검증에 실패했습니다.");
        }
    }

    /**
     * Role ID → code 문자열 변환 (JWT/Security 계층 호환용)
     * CustomUserDetailsService가 DB의 code를 사용하므로 JWT에도 동일한 code를 저장
     */
    private String resolveRoleCode(Long roleId) {
        if (roleId == null) return "USER";
        if (roleId.equals(com.venueon.common.model.CodeConstants.ROLE_ADMIN_ID)) return "ADMIN";
        if (roleId.equals(com.venueon.common.model.CodeConstants.ROLE_HOST_ID)) return "HOST";
        return "USER";
    }
}
