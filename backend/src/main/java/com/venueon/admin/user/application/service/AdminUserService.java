package com.venueon.admin.user.application.service;

import com.venueon.admin.user.application.command.UpdateUserCommand;
import com.venueon.admin.user.application.port.in.*;
import com.venueon.admin.user.application.port.out.AdminUserRepositoryPort;
import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자용 회원 관리 서비스
 * - Port(AdminUserRepositoryPort)만 의존 — JPA 직접 참조 금지!
 * - 5개 UseCase 구현
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService implements
        GetAdminUserListUseCase,
        GetAdminUserDetailUseCase,
        UpdateAdminUserUseCase,
        ChangeAdminUserStatusUseCase,
        DeleteAdminUserUseCase {

    private final AdminUserRepositoryPort adminUserRepositoryPort;

    // ── 목록 조회 ──

    @Override
    public Page<User> getUsers(String keyword, String role, Boolean active, Pageable pageable) {
        return adminUserRepositoryPort.findUsers(keyword, role, active, pageable);
    }

    // ── 상세 조회 ──

    @Override
    public User getUserById(Long id) {
        return findUserOrThrow(id);
    }

    @Override
    public com.venueon.user.domain.model.HostProfile getHostProfileByUserId(Long userId) {
        return adminUserRepositoryPort.findHostProfileByUserId(userId).orElse(null);
    }

    // ── 정보 수정 ──

    @Override
    @Transactional
    public User updateUser(Long id, UpdateUserCommand command) {
        User user = findUserOrThrow(id);

        if (command.nickname() != null) {
            user.changeNickname(command.nickname());
        }
        if (command.roleId() != null) {
            com.venueon.common.model.DomainCode roleCode = com.venueon.common.model.DomainCode.of(command.roleId(), "역할");
            user.changeRole(roleCode);
        }
        if (command.phone() != null) {
            user.changePhone(command.phone());
        }

        User savedUser = adminUserRepositoryPort.save(user);
        log.info("회원 정보 수정 완료: id={}, nickname={}, role={}", id, savedUser.getNickname(), savedUser.getRole());
        return savedUser;
    }

    // ── 활성/비활성 전환 ──

    @Override
    @Transactional
    public void changeStatus(Long id, boolean active) {
        User user = findUserOrThrow(id);

        if (active) {
            user.activate();
        } else {
            user.deactivate();
        }

        adminUserRepositoryPort.save(user);
        log.info("회원 상태 변경: id={}, active={}", id, active);
    }

    // ── 삭제 ──

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);

        // 관리자 계정 삭제 방지
        if (user.isAdmin()) {
            throw new BusinessException(ErrorCode.CANNOT_DELETE_ADMIN, "관리자 계정은 삭제할 수 없습니다.");
        }

        adminUserRepositoryPort.deleteById(id);
        log.info("회원 삭제 완료: id={}, email={}", id, user.getEmail());
    }

    // ── private 헬퍼 ──

    private User findUserOrThrow(Long id) {
        return adminUserRepositoryPort.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다. id=" + id));
    }
}
