package com.venueon.cart.adapter.out.persistence;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.adapter.out.persistence.repository.CartJpaRepository;
import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.cart.domain.model.Cart;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
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
    private final EventJpaRepository eventJpaRepository;
    private final CartMapper cartMapper;

    @Override
    public List<Cart> findByUserId(Long userId) {
        return cartJpaRepository.findByUserId(userId).stream()
                .map(cartMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Cart> findById(Long id) {
        return cartJpaRepository.findById(id)
                .map(cartMapper::toDomain);
    }

    @Override
    public Optional<Cart> findByUserIdAndEventId(Long userId, Long eventId) {
        return cartJpaRepository.findByUserIdAndEventId(userId, eventId)
                .map(cartMapper::toDomain);
    }

    @Override
    public boolean existsByUserIdAndEventId(Long userId, Long eventId) {
        return cartJpaRepository.existsByUserIdAndEventId(userId, eventId);
    }

    @Override
    public Cart save(Cart cart) {
        // User와 Event 조회
        UserJpaEntity user = userJpaRepository.findById(cart.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + cart.getUserId()));

        EventJpaEntity event = eventJpaRepository.findById(cart.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + cart.getEventId()));

        // 업데이트인 경우 기존 엔티티 조회
        CartJpaEntity entity;
        if (cart.getId() != null) {
            entity = cartJpaRepository.findById(cart.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Cart not found with id: " + cart.getId()));
            entity.updateQuantity(cart.getQuantity());
        } else {
            entity = cartMapper.toEntity(cart, user, event);
        }

        CartJpaEntity saved = cartJpaRepository.save(entity);
        return cartMapper.toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        cartJpaRepository.deleteById(id);
    }

    @Override
    public void deleteByUserId(Long userId) {
        cartJpaRepository.deleteByUserId(userId);
    }
}
