package com.venueon.ticket.adapter.out.persistence.repository;

import com.venueon.ticket.adapter.out.persistence.entity.RecruitmentStatusJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecruitmentStatusJpaRepository extends JpaRepository<RecruitmentStatusJpaEntity, Long> {
    Optional<RecruitmentStatusJpaEntity> findByCode(String code);
}
