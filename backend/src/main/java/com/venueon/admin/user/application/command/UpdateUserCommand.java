package com.venueon.admin.user.application.command;


/**
 * 회원 수정 커맨드 (Application 계층 입력 DTO)
 * Controller DTO(Request)와 분리하여 계층 간 결합 방지
 */
public record UpdateUserCommand(
        String nickname,
        Long roleId,
        String phone
) {
}
