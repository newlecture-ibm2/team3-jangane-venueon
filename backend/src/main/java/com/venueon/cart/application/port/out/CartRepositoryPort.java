package com.venueon.cart.application.port.out;

import com.venueon.cart.domain.model.Cart;

import java.util.List;
import java.util.Optional;

/**
 * 장바구니 저장/조회 인터페이스 (Port-Out)
 * Service는 이 포트만 의존 — JPA 직접 참조 금지
 */
public interface CartRepositoryPort {

    /**
     * 사용자의 모든 장바구니 항목 조회
     */
    List<Cart> findByUserEmail(String userEmail);

    /**
     * ID로 장바구니 항목 조회
     */
    Optional<Cart> findById(Long id);

    /**
     * 사용자와 이벤트로 장바구니 항목 조회 (중복 체크용)
     */
    Optional<Cart> findByUserEmailAndEventId(String userEmail, Long eventId);

    /**
     * 장바구니 항목 존재 여부 확인
     */
    boolean existsByUserEmailAndEventId(String userEmail, Long eventId);

    /**
     * 장바구니 항목 저장
     */
    Cart save(Cart cart);

    /**
     * ID로 장바구니 항목 삭제
     */
    void deleteById(Long id);

    /**
     * 사용자의 모든 장바구니 항목 삭제
     */
    void deleteByUserEmail(String userEmail);
}
