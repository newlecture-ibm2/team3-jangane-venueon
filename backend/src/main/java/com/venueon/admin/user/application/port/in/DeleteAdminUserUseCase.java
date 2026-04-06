package com.venueon.admin.user.application.port.in;

/**
 * 관리자용 회원 삭제 UseCase
 */
public interface DeleteAdminUserUseCase {

    /**
     * 회원 삭제
     * - 관리자(ADMIN) 계정은 삭제 불가
     *
     * @param id 회원 ID
     */
    void deleteUser(Long id);
}
