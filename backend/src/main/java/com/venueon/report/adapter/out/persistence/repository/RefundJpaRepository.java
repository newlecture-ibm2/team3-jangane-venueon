package com.venueon.report.adapter.out.persistence.repository;

import com.venueon.report.adapter.out.persistence.entity.RefundJpaEntity;
import com.venueon.report.domain.model.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefundJpaRepository extends JpaRepository<RefundJpaEntity, Long> {

    Page<RefundJpaEntity> findByStatus(RefundStatus status, Pageable pageable);

    Page<RefundJpaEntity> findAllByOrderByRequestedAtDesc(Pageable pageable);

    Optional<RefundJpaEntity> findByOrderId(Long orderId);

    long countByStatus(RefundStatus status);
}
