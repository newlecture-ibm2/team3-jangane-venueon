package com.venueon.cart.adapter.out.persistence;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.adapter.out.persistence.repository.CartJpaRepository;
import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.cart.domain.model.Cart;
import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventSessionJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * CartRepositoryPort 구현체 — JPA 연동
 * Hexagonal Architecture: Adapter Layer (Persistence)
 */
@Component
@RequiredArgsConstructor
public class CartPersistenceAdapter implements CartRepositoryPort {

    private final CartJpaRepository cartJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final EventSessionJpaRepository eventSessionJpaRepository;
    private final CartMapper cartMapper;

    @Override
    public List<Cart> findByUserEmail(String userEmail) {
        return cartJpaRepository.findByUserEmail(userEmail).stream()
                .map(cartMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Cart> findById(Long id) {
        return cartJpaRepository.findById(id)
                .map(cartMapper::toDomain);
    }

    @Override
    public Optional<Cart> findByUserEmailAndSessionId(String userEmail, Long sessionId) {
        return cartJpaRepository.findByUserEmailAndEventSessionId(userEmail, sessionId)
                .map(cartMapper::toDomain);
    }

    @Override
    public boolean existsByUserEmailAndSessionId(String userEmail, Long sessionId) {
        return cartJpaRepository.existsByUserEmailAndEventSessionId(userEmail, sessionId);
    }

    @Override
    public Cart save(Cart cart) {
        // User와 EventSession 조회
        UserJpaEntity user = userJpaRepository.findByEmail(cart.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + cart.getUserEmail()));

        EventSessionJpaEntity session = eventSessionJpaRepository.findById(cart.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("EventSession not found with id: " + cart.getSessionId()));

        // 업데이트인 경우 기존 엔티티 조회
        CartJpaEntity entity;
        if (cart.getId() != null) {
            entity = cartJpaRepository.findById(cart.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Cart not found with id: " + cart.getId()));
            entity.updateQuantity(cart.getQuantity());
        } else {
            entity = cartMapper.toEntity(cart, user, session);
        }

        CartJpaEntity saved = cartJpaRepository.save(entity);
        return cartMapper.toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        cartJpaRepository.deleteById(id);
    }

    @Override
    public void deleteByUserEmail(String userEmail) {
        cartJpaRepository.deleteByUserEmail(userEmail);
    }
}
