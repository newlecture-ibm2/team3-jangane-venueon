package com.venueon.event.application.port.in;

import com.venueon.event.domain.model.Session;

/**
 * 세션 모집 상태 수동 관리 UseCase
 * 호스트가 세션별 모집을 수동으로 마감/재개
 */
public interface ManageRecruitmentUseCase {

    /**
     * 모집 상태 수동 관리
     * @param command 세션ID, 이벤트ID, 요청자 정보, 강제 상태(PENDING, OPEN, CLOSED, AUTO)
     * @return 변경된 세션
     */
    Session changeRecruitmentStatus(ChangeRecruitmentStatusCommand command);

    record ChangeRecruitmentStatusCommand(
        Long sessionId,
        Long eventId,
        Long requesterId,
        String requesterRole,
        String forcedStatus // "PENDING", "OPEN", "CLOSED", or "AUTO"
    ) {}

    /**
     * 진행 상태 수동 관리
     * @param command 세션ID, 이벤트ID, 요청자 정보, 강제 상태(PUBLISHED, ONGOING, ENDED, CANCELLED, AUTO)
     * @return 변경된 세션
     */
    Session changeSessionStatus(ChangeSessionStatusCommand command);

    record ChangeSessionStatusCommand(
        Long sessionId,
        Long eventId,
        Long requesterId,
        String requesterRole,
        String forcedStatus // "PUBLISHED", "ONGOING", "ENDED", "CANCELLED", or "AUTO"
    ) {}
}
