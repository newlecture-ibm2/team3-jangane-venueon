package com.venueon.wishlist.domain.model;
import lombok.*;
import java.time.LocalDateTime;

@Getter @AllArgsConstructor(access = AccessLevel.PRIVATE)
public class WishlistItem {
    private Long id;
    private Long userId;
    private Long eventId;
    private LocalDateTime createdAt;
    
    public static WishlistItem create(Long id, Long userId, Long eventId, LocalDateTime createdAt) {
        return new WishlistItem(id, userId, eventId, createdAt);
    }
}
