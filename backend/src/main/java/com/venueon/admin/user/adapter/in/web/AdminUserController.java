package com.venueon.admin.user.adapter.in.web;

import com.venueon.admin.user.adapter.in.web.dto.request.AdminChangeUserStatusRequest;
import com.venueon.admin.user.adapter.in.web.dto.request.AdminUpdateUserRequest;
import com.venueon.admin.user.adapter.in.web.dto.response.AdminUserDetailResponse;
import com.venueon.admin.user.adapter.in.web.dto.response.AdminUserListResponse;
import com.venueon.admin.user.application.command.UpdateUserCommand;
import com.venueon.admin.user.application.port.in.*;
import com.venueon.common.dto.ApiResponse;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.UserRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자용 회원 관리 API Controller
 * - UseCase 인터페이스에만 의존 (Service 구현체 직접 참조 ✕)
 * - Controller에 비즈니스 로직 없음 — 요청 변환 + UseCase 호출 + 응답 생성만
 */
@Slf4j
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final GetAdminUserListUseCase getAdminUserListUseCase;
    private final GetAdminUserDetailUseCase getAdminUserDetailUseCase;
    private final UpdateAdminUserUseCase updateAdminUserUseCase;
    private final ChangeAdminUserStatusUseCase changeAdminUserStatusUseCase;
    private final DeleteAdminUserUseCase deleteAdminUserUseCase;

    /**
     * GET /admin/users — 회원 목록 조회 (검색 + 역할 필터 + 페이징)
     *
     * @param keyword  검색어 (이메일 또는 닉네임)
     * @param role     역할 필터 (ADMIN, HOST, USER)
     * @param pageable 페이징 (기본: page=0, size=20, 최신순)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserListResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.debug("회원 목록 조회: keyword={}, role={}, page={}", keyword, role, pageable.getPageNumber());

        UserRole userRole = parseRole(role);
        Page<User> users = getAdminUserListUseCase.getUsers(keyword, userRole, pageable);
        Page<AdminUserListResponse> response = users.map(AdminUserListResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /admin/users/{id} — 회원 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> getUser(@PathVariable Long id) {
        log.debug("회원 상세 조회: id={}", id);

        User user = getAdminUserDetailUseCase.getUserById(id);
        AdminUserDetailResponse response = AdminUserDetailResponse.from(user);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PUT /admin/users/{id} — 회원 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {

        log.debug("회원 정보 수정: id={}", id);

        UserRole newRole = parseRole(request.role());
        UpdateUserCommand command = new UpdateUserCommand(
                request.nickname(),
                newRole,
                request.phone()
        );

        User updatedUser = updateAdminUserUseCase.updateUser(id, command);
        AdminUserDetailResponse response = AdminUserDetailResponse.from(updatedUser);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PATCH /admin/users/{id}/status — 회원 활성/비활성 전환
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> changeUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminChangeUserStatusRequest request) {

        log.debug("회원 상태 변경: id={}, active={}", id, request.active());

        changeAdminUserStatusUseCase.changeStatus(id, request.active());

        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * DELETE /admin/users/{id} — 회원 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.debug("회원 삭제: id={}", id);

        deleteAdminUserUseCase.deleteUser(id);

        return ResponseEntity.ok(ApiResponse.success());
    }

    // ── private 헬퍼 ──

    /**
     * 문자열 role을 UserRole enum으로 변환 (null이면 null 반환)
     */
    private UserRole parseRole(String role) {
        if (role == null || role.isBlank()) {
            return null;
        }
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "유효하지 않은 역할입니다: " + role);
        }
    }
}
