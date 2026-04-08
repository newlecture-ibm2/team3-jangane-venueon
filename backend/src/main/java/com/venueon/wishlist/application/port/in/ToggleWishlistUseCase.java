package com.venueon.wishlist.application.port.in;
public interface ToggleWishlistUseCase {
    boolean toggle(Long userId, Long eventId);
}
