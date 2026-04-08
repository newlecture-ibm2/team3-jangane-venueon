package com.venueon.wishlist.application.port.out;
import com.venueon.wishlist.domain.model.WishlistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
public interface LoadWishlistPort {
    Optional<WishlistItem> findByUserIdAndEventId(Long userId, Long eventId);
    Page<WishlistItem> findByUserId(Long userId, Pageable pageable);
    boolean exists(Long userId, Long eventId);
}
