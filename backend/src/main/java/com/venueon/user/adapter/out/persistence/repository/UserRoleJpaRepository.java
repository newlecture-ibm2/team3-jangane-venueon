package com.venueon.user.adapter.out.persistence.repository;

import com.venueon.user.adapter.out.persistence.entity.UserRoleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRoleJpaRepository extends JpaRepository<UserRoleJpaEntity, Long> {
    Optional<UserRoleJpaEntity> findByCode(String code);
}
