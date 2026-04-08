package com.venueon.admin.user.application.port.in;

import com.venueon.admin.user.application.command.UpdateUserCommand;
import com.venueon.user.domain.model.User;

/**
 * 관리자용 회원 정보 수정 UseCase
 */
public interface UpdateAdminUserUseCase {

    /**
     * 회원 정보 수정 (닉네임, 역할 등)
     *
     * @param id      회원 ID
     * @param command 수정할 정보
     * @return 수정된 회원 도메인 모델
     */
    User updateUser(Long id, UpdateUserCommand command);
}
