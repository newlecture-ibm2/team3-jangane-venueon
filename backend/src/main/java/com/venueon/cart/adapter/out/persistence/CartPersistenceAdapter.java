package com.venueon.cart.adapter.out.persistence;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.adapter.out.persistence.repository.CartJpaRepository;
import com.venueon.cart.application.port.out.CartRepositoryPort;
import com.venueon.cart.domain.model.Cart;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.ticket.adapter.out.persistence.repository.TicketJpaRepository;
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
 *
 * v6: Session 기반 → Ticket 기반으로 전환
 */
@Component
@RequiredArgsConstructor
public class CartPersistenceAdapter implements CartRepositoryPort {

    private final CartJpaRepository cartJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final TicketJpaRepository ticketJpaRepository;
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
    public List<Cart> findAllByIds(List<Long> ids) {
        return cartJpaRepository.findAllById(ids).stream()
                .map(cartMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Cart> findByUserEmailAndTicketId(String userEmail, Long ticketId) {
        return cartJpaRepository.findByUserEmailAndTicketId(userEmail, ticketId)
                .map(cartMapper::toDomain);
    }

    @Override
    public boolean existsByUserEmailAndTicketId(String userEmail, Long ticketId) {
        return cartJpaRepository.existsByUserEmailAndTicketId(userEmail, ticketId);
    }

    @Override
    public Cart save(Cart cart) {
        // User와 Ticket 조회
        UserJpaEntity user = userJpaRepository.findByEmail(cart.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + cart.getUserEmail()));

        TicketJpaEntity ticket = ticketJpaRepository.findById(cart.getTicketId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with id: " + cart.getTicketId()));

        // 업데이트인 경우 기존 엔티티 조회
        CartJpaEntity entity;
        if (cart.getId() != null) {
            entity = cartJpaRepository.findById(cart.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Cart not found with id: " + cart.getId()));
            entity.updateQuantity(cart.getQuantity());
        } else {
            entity = cartMapper.toEntity(cart, user, ticket);
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
