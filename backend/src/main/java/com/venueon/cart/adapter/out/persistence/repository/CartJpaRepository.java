package com.venueon.cart.adapter.out.persistence.repository;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Cart JPA Repository
 *
 * v6: eventSession 기반 → ticket 기반으로 전환
 */
@Repository
public interface CartJpaRepository extends JpaRepository<CartJpaEntity, Long> {

    /**
     * 사용자의 모든 장바구니 항목 조회
     */
    List<CartJpaEntity> findByUserEmail(String userEmail);

    /**
     * 사용자와 특정 티켓으로 장바구니 항목 조회
     */
    Optional<CartJpaEntity> findByUserEmailAndTicketId(String userEmail, Long ticketId);

    /**
     * 사용자와 특정 티켓으로 장바구니 항목 존재 여부 확인
     */
    boolean existsByUserEmailAndTicketId(String userEmail, Long ticketId);

    /**
     * 사용자의 모든 장바구니 항목 삭제
     */
    void deleteByUserEmail(String userEmail);
}
