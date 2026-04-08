package com.venueon.admin.user.application.port.in;

/**
 * 관리자용 회원 활성/비활성 전환 UseCase
 */
public interface ChangeAdminUserStatusUseCase {

    /**
     * 회원 활성 상태 변경 (활성화 / 비활성화)
     *
     * @param id     회원 ID
     * @param active true: 활성화, false: 비활성화(정지)
     */
    void changeStatus(Long id, boolean active);
}
