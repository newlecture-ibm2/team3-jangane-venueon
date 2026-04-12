package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Session;

/**
 * 세션 모집 상태 수동 관리 UseCase
 * 호스트가 세션별 모집을 수동으로 마감/재개
 */
public interface ManageRecruitmentUseCase {

    /**
     * 모집 마감/재개 토글
     * @param command 세션ID, 이벤트ID, 요청자 정보, 마감 여부
     * @return 변경된 세션
     */
    Session toggleRecruitment(ToggleRecruitmentCommand command);

    record ToggleRecruitmentCommand(
        Long sessionId,
        Long eventId,
        Long requesterId,
        String requesterRole,
        boolean closed
    ) {}
}
