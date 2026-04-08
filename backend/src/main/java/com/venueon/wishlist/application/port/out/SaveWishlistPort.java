package com.venueon.wishlist.application.port.out;
import com.venueon.wishlist.domain.model.WishlistItem;
public interface SaveWishlistPort {
    WishlistItem save(WishlistItem wishlistItem);
}
