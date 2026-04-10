package com.venueon.cart.adapter.out.persistence;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.domain.model.Cart;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Cart Entity <-> Domain Model Mapper
 */
@Component
public class CartMapper {

    /**
     * JPA Entity -> Domain Model
     */
    public Cart toDomain(CartJpaEntity entity) {
        if (entity == null) return null;

        EventSessionJpaEntity session = entity.getEventSession();
        EventJpaEntity event = session != null ? session.getEvent() : null;

        return new Cart(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getEmail() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                session != null ? session.getId() : null,
                session != null ? session.getTitle() : null,
                session != null ? session.getPrice() : 0,
                session != null ? session.getPrice() : 0, // discountedPrice -> price
                entity.getQuantity(),
                session != null ? session.getStartTime() : null,
                entity.getCreatedAt()
        );
    }

    /**
     * Domain Model -> JPA Entity (for save)
     * Note: User와 EventSession을 주입
     */
    public CartJpaEntity toEntity(Cart cart, UserJpaEntity user, EventSessionJpaEntity session) {
        if (cart == null) return null;

        return CartJpaEntity.builder()
                .id(cart.getId())
                .user(user)
                .eventSession(session)
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}
