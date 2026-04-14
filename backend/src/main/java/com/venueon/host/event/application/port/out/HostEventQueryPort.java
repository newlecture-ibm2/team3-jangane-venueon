package com.venueon.host.event.application.port.out;

import com.venueon.host.event.adapter.in.web.dto.HostEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Host 이벤트 조회 Port (out) — Hexagonal Architecture
 * Service(application)는 이 인터페이스만 의존, JPA 직접 참조 금지.
 */
public interface HostEventQueryPort {

    Page<HostEventResponse> findByHostId(Long hostId, String status, Pageable pageable);

    Page<HostEventResponse> findDraftsByHostId(Long hostId, Pageable pageable);
}
