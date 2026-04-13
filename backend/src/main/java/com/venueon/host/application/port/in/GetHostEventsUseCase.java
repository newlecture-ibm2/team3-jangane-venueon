package com.venueon.host.application.port.in;

import com.venueon.host.dto.HostEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 호스트 이벤트 목록 조회 유스케이스 (Port-In)
 */
public interface GetHostEventsUseCase {

    /** 호스트 본인의 이벤트 목록 (상태 필터 선택적) */
    Page<HostEventResponse> getHostEvents(Long hostId, String status, Pageable pageable);

    /** 호스트 본인의 임시저장(DRAFT) 이벤트 목록 */
    Page<HostEventResponse> getHostDraftEvents(Long hostId, Pageable pageable);
}
