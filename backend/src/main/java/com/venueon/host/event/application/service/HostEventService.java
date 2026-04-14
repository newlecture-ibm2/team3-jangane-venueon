package com.venueon.host.event.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.host.event.application.port.in.GetHostEventsUseCase;
import com.venueon.host.event.application.port.out.HostEventQueryPort;
import com.venueon.host.event.adapter.in.web.dto.HostEventResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 호스트 이벤트 관리 서비스
 * — Port 인터페이스만 의존 (JPA 직접 참조 제거)
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class HostEventService implements GetHostEventsUseCase {

    private final HostEventQueryPort hostEventQueryPort;

    @Override
    public Page<HostEventResponse> getHostEvents(Long hostId, String status, Pageable pageable) {
        log.debug("호스트 이벤트 목록 조회: hostId={}, status={}", hostId, status);
        return hostEventQueryPort.findByHostId(hostId, status, pageable);
    }

    @Override
    public Page<HostEventResponse> getHostDraftEvents(Long hostId, Pageable pageable) {
        log.debug("호스트 DRAFT 이벤트 목록 조회: hostId={}", hostId);
        return hostEventQueryPort.findDraftsByHostId(hostId, pageable);
    }

    @Override
    public com.venueon.host.event.adapter.in.web.dto.HostEventDetailResponse getHostEventDetail(Long hostId, Long eventId) {
        log.debug("호스트 이벤트 상세 조회: hostId={}, eventId={}", hostId, eventId);
        return hostEventQueryPort.getEventDetail(hostId, eventId);
    }
}
