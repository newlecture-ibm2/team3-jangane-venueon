package com.venueon.cart.adapter.out.persistence.repository;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Cart JPA Repository
 */
@Repository
public interface CartJpaRepository extends JpaRepository<CartJpaEntity, Long> {

    /**
     * 사용자의 모든 장바구니 항목 조회
     */
    List<CartJpaEntity> findByUserEmail(String userEmail);

    /**
     * 사용자와 특정 세션으로 장바구니 항목 조회
     */
    Optional<CartJpaEntity> findByUserEmailAndEventSessionId(String userEmail, Long eventSessionId);

    /**
     * 사용자와 특정 세션으로 장바구니 항목 존재 여부 확인
     */
    boolean existsByUserEmailAndEventSessionId(String userEmail, Long eventSessionId);

    /**
     * 사용자의 모든 장바구니 항목 삭제
     */
    void deleteByUserEmail(String userEmail);
}
