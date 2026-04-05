package com.venueon.user.adapter.out.persistence.repository;

import com.venueon.user.adapter.out.persistence.entity.HostProfileJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HostProfileJpaRepository extends JpaRepository<HostProfileJpaEntity, Long> {

    Optional<HostProfileJpaEntity> findByUserId(Long userId);
}
