package com.venueon.user.adapter.out.persistence.repository;

import com.venueon.user.adapter.out.persistence.entity.EmailVerificationTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenJpaRepository extends JpaRepository<EmailVerificationTokenJpaEntity, Long> {

    Optional<EmailVerificationTokenJpaEntity> findByToken(String token);

    Optional<EmailVerificationTokenJpaEntity> findByEmail(String email);

    void deleteByEmail(String email);
}
