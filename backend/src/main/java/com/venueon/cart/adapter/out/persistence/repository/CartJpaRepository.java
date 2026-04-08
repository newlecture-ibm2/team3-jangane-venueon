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
    List<CartJpaEntity> findByUserId(Long userId);

    /**
     * 사용자와 이벤트로 장바구니 항목 조회
     */
    Optional<CartJpaEntity> findByUserIdAndEventId(Long userId, Long eventId);

    /**
     * 사용자와 이벤트로 장바구니 항목 존재 여부 확인
     */
    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    /**
     * 사용자의 모든 장바구니 항목 삭제
     */
    void deleteByUserId(Long userId);
}
