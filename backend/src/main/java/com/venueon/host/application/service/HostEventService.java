package com.venueon.host.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.host.adapter.out.persistence.HostEventMapper;
import com.venueon.host.adapter.out.persistence.repository.HostEventJpaRepository;
import com.venueon.host.application.port.in.GetHostEventsUseCase;
import com.venueon.host.dto.HostEventResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 호스트 이벤트 관리 서비스
 * — GetHostEventsUseCase 구현
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class HostEventService implements GetHostEventsUseCase {

    private final HostEventJpaRepository hostEventJpaRepository;
    private final HostEventMapper hostEventMapper;

    @Override
    public Page<HostEventResponse> getHostEvents(Long hostId, String status, Pageable pageable) {
        log.debug("호스트 이벤트 목록 조회: hostId={}, status={}", hostId, status);

        Page<EventJpaEntity> page;

        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            page = hostEventJpaRepository.findByCreatorId(hostId, pageable);
        } else {
            String eventStatus = status.toUpperCase();
            page = hostEventJpaRepository.findByCreatorIdAndStatus(hostId, eventStatus, pageable);
        }

        return page.map(hostEventMapper::toResponse);
    }

    @Override
    public Page<HostEventResponse> getHostDraftEvents(Long hostId, Pageable pageable) {
        log.debug("호스트 DRAFT 이벤트 목록 조회: hostId={}", hostId);

        Page<EventJpaEntity> page = hostEventJpaRepository.findByCreatorIdAndStatus(
                hostId, "DRAFT", pageable
        );

        return page.map(hostEventMapper::toResponse);
    }
}
