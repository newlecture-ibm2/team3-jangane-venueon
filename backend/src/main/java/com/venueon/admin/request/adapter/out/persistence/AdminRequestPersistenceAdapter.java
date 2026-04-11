package com.venueon.admin.request.adapter.out.persistence;

import com.venueon.admin.request.adapter.out.persistence.entity.AdminRequestJpaEntity;
import com.venueon.admin.request.adapter.out.persistence.repository.AdminRequestJpaRepository;
import com.venueon.admin.request.application.port.out.AdminRequestRepositoryPort;
import com.venueon.admin.request.domain.model.AdminRequest;
import com.venueon.admin.request.domain.model.RequestCategory;
import com.venueon.admin.request.domain.model.RequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 어드민 요청 Persistence Adapter
 * - JPA Repository를 감싸서 Port(Out) 인터페이스를 구현
 */
@Component
@RequiredArgsConstructor
public class AdminRequestPersistenceAdapter implements AdminRequestRepositoryPort {

    private final AdminRequestJpaRepository jpaRepository;
    private final AdminRequestMapper mapper;

    @Override
    public AdminRequest save(AdminRequest request) {
        AdminRequestJpaEntity entity = mapper.toEntity(request);
        AdminRequestJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<AdminRequest> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Page<AdminRequest> findAllWithFilters(RequestCategory category, RequestStatus status, Pageable pageable) {
        return jpaRepository.findAllWithFilters(category, status, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<AdminRequest> findByRequesterIdWithFilters(Long requesterId, RequestCategory category, RequestStatus status, Pageable pageable) {
        return jpaRepository.findByRequesterIdWithFilters(requesterId, category, status, pageable)
                .map(mapper::toDomain);
    }
}
