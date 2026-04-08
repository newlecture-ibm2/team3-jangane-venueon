package com.venueon.cart.adapter.out.persistence;

import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.domain.model.Cart;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
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

        EventJpaEntity event = entity.getEvent();

        return new Cart(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getEmail() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                event != null ? event.getPrice() : 0,
                event != null ? event.getPrice() : 0, // discountedPrice -> price (할인 없음)
                entity.getQuantity(),
                event != null ? event.getStartDate() : null,
                entity.getCreatedAt()
        );
    }

    /**
     * Domain Model -> JPA Entity (for save)
     * Note: User와 Event는 ID로 조회하여 설정해야 함
     */
    public CartJpaEntity toEntity(Cart cart, UserJpaEntity user, EventJpaEntity event) {
        if (cart == null) return null;

        return CartJpaEntity.builder()
                .id(cart.getId())
                .user(user)
                .event(event)
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}
