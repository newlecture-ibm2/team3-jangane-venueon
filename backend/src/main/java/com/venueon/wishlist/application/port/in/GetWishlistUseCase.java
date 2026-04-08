package com.venueon.wishlist.application.port.in;
import com.venueon.wishlist.adapter.in.web.dto.WishlistResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface GetWishlistUseCase {
    Page<WishlistResponse> getWishlist(Long userId, Pageable pageable);
    boolean checkWishlist(Long userId, Long eventId);
}
