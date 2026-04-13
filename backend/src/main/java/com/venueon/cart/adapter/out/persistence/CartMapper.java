package com.venueon.cart.adapter.out.persistence;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.domain.model.Cart;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Cart Entity <-> Domain Model Mapper
 *
 * v6: Session 기반 → Ticket 기반으로 전환
 */
@Component
public class CartMapper {

    /**
     * JPA Entity -> Domain Model
     */
    public Cart toDomain(CartJpaEntity entity) {
        if (entity == null) return null;

        TicketJpaEntity ticket = entity.getTicket();
        // Ticket → Event 관계를 통해 이벤트 정보 추출
        var event = ticket != null ? ticket.getEvent() : null;

        return new Cart(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getEmail() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                ticket != null ? ticket.getId() : null,
                ticket != null ? ticket.getName() : null,
                ticket != null ? ticket.getPrice() : 0,
                ticket != null ? ticket.getOriginalPrice() : 0,
                entity.getQuantity(),
                entity.getCreatedAt()
        );
    }

    /**
     * Domain Model -> JPA Entity (for save)
     * Note: User와 Ticket을 주입
     */
    public CartJpaEntity toEntity(Cart cart, UserJpaEntity user, TicketJpaEntity ticket) {
        if (cart == null) return null;

        return CartJpaEntity.builder()
                .id(cart.getId())
                .user(user)
                .ticket(ticket)
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}
