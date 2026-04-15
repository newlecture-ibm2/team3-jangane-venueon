package com.venueon.admin.user.application.service;

import com.venueon.admin.user.application.command.UpdateUserCommand;
import com.venueon.admin.user.application.port.in.*;
import com.venueon.admin.user.application.port.out.AdminUserRepositoryPort;
import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.user.domain.model.User;
import com.venueon.user.domain.model.HostProfile;
import com.venueon.common.model.DomainCode;
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
        DeleteAdminUserUseCase,
        GetAdminSummaryUseCase {

    private final AdminUserRepositoryPort adminUserRepositoryPort;
    private final com.venueon.event.application.port.out.EventRepositoryPort eventRepositoryPort;

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
    public HostProfile getHostProfileByUserId(Long userId) {
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
            DomainCode roleCode = DomainCode.of(command.roleId(), "역할");
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
            user.setStatusOnly(true);
            // 만약 이메일이 deleted_... 로 되어 있다면 복구
            restoreEmailIfDeleted(user);
        } else {
            // 어드민에서 비활성화 시에는 로그인 안내를 위해 이메일을 변경하지 않고 상태값만 변경
            user.setStatusOnly(false);
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

        // 어드민에서 삭제 시에도 로그인 시 "탈퇴 회원" 안내를 위해 소프트 삭제(상태값만 변경) 처리
        user.setStatusOnly(false);
        adminUserRepositoryPort.save(user);
        log.info("회원 소프트 삭제 완료: id={}, email={}", id, user.getEmail());
    }

    // ── 어드민 대시보드 요약 ──

    @Override
    public com.venueon.admin.user.adapter.in.web.dto.response.AdminSummaryResponse getSummary() {
        java.time.LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();

        // 1. 오늘의 신규 수치
        long newUserCount = adminUserRepositoryPort.countByRoleIdAndCreatedAtAfter(2L, todayStart);
        long newHostCount = adminUserRepositoryPort.countByRoleIdAndCreatedAtAfter(3L, todayStart);
        long newEventCount = eventRepositoryPort.countByCreatedAtAfter(todayStart);

        // 2. 전체 누적 수치
        long totalUserCount = adminUserRepositoryPort.countByRoleId(2L);
        long totalHostCount = adminUserRepositoryPort.countByRoleId(3L);

        // 3. 최근 7일 트렌드 데이터 포인트 생성
        java.util.List<com.venueon.admin.user.adapter.in.web.dto.response.AdminSummaryResponse.DailyTrend> trends = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            java.time.LocalDateTime start = date.atStartOfDay();
            java.time.LocalDateTime end = date.atTime(23, 59, 59);

            // 해당 일자의 범위를 조회할 수 있도록 쿼리 포트 메서드를 활용 (여기서는 편의상 After를 사용하거나 Repository를 확장)
            // 실제 구현상 포트에 countByDateRange 같은 메서드가 있으면 더 정확합니다.
            // 일단은 현재 구현된 After 메서드와 날짜 계산을 조합해 트렌드를 구성합니다.
            long dailyUsers = adminUserRepositoryPort.countByRoleIdAndCreatedAtAfter(2L, start) - adminUserRepositoryPort.countByRoleIdAndCreatedAtAfter(2L, end);
            long dailyHosts = adminUserRepositoryPort.countByRoleIdAndCreatedAtAfter(3L, start) - adminUserRepositoryPort.countByRoleIdAndCreatedAtAfter(3L, end);
            long dailyEvents = eventRepositoryPort.countByCreatedAtAfter(start) - eventRepositoryPort.countByCreatedAtAfter(end);

            // 음수 방지 처리 (After 로직 특성상)
            dailyUsers = Math.max(0, dailyUsers);
            dailyHosts = Math.max(0, dailyHosts);
            dailyEvents = Math.max(0, dailyEvents);

            trends.add(com.venueon.admin.user.adapter.in.web.dto.response.AdminSummaryResponse.DailyTrend.builder()
                    .date(date.getDayOfWeek().toString().substring(0, 3)) // "MON", "TUE" 등
                    .users(dailyUsers)
                    .hosts(dailyHosts)
                    .events(dailyEvents)
                    .build());
        }

        return com.venueon.admin.user.adapter.in.web.dto.response.AdminSummaryResponse.builder()
                .newUserCount(newUserCount)
                .newHostCount(newHostCount)
                .newEventCount(newEventCount)
                .totalUserCount(totalUserCount)
                .totalHostCount(totalHostCount)
                .trends(trends)
                .build();
    }

    // ── private 헬퍼 ──

    private void restoreEmailIfDeleted(User user) {
        String email = user.getEmail();
        if (email != null && email.startsWith("deleted_")) {
            // "deleted_1713102047000_원래이메일" 형식에서 이메일 부분만 추출
            int secondUnderscoreIdx = email.indexOf("_", "deleted_".length());
            if (secondUnderscoreIdx != -1 && secondUnderscoreIdx + 1 < email.length()) {
                String originalEmail = email.substring(secondUnderscoreIdx + 1);
                user.restoreEmail(originalEmail);
                log.info("회원 이메일 복구 완료: id={}, restoredEmail={}", user.getId(), originalEmail);
            }
        }
    }

    private User findUserOrThrow(Long id) {
        return adminUserRepositoryPort.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다. id=" + id));
    }
}
