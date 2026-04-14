package com.venueon.host.event.adapter.out.persistence;

import com.venueon.host.event.adapter.in.web.dto.HostEventResponse;
import com.venueon.host.event.adapter.out.persistence.repository.HostEventJpaRepository;
import com.venueon.host.event.application.port.out.HostEventQueryPort;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

/**
 * HostEventQueryPort 구현체 — JPA 접근은 이 Adapter에서만 수행.
 */
@Component
@RequiredArgsConstructor
public class HostEventPersistenceAdapter implements HostEventQueryPort {

    private final HostEventJpaRepository hostEventJpaRepository;
    private final HostEventMapper hostEventMapper;

    @Override
    public Page<HostEventResponse> findByHostId(Long hostId, String status, Pageable pageable) {
        Page<EventJpaEntity> page;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            page = hostEventJpaRepository.findByCreatorId(hostId, pageable);
        } else {
            page = hostEventJpaRepository.findByCreatorIdAndStatus(hostId, status.toUpperCase(), pageable);
        }
        return page.map(hostEventMapper::toResponse);
    }

    @Override
    public Page<HostEventResponse> findDraftsByHostId(Long hostId, Pageable pageable) {
        return hostEventJpaRepository.findByCreatorIdAndStatus(hostId, "DRAFT", pageable)
                .map(hostEventMapper::toResponse);
    }
}
