package com.venueon.wishlist.application.service;
import com.venueon.wishlist.application.port.in.ToggleWishlistUseCase;
import com.venueon.wishlist.application.port.in.GetWishlistUseCase;
import com.venueon.wishlist.application.port.out.LoadWishlistPort;
import com.venueon.wishlist.application.port.out.SaveWishlistPort;
import com.venueon.wishlist.application.port.out.DeleteWishlistPort;
import com.venueon.wishlist.application.port.out.LoadEventPort;
import com.venueon.wishlist.domain.model.WishlistItem;
import com.venueon.wishlist.adapter.in.web.dto.WishlistResponse;
import com.venueon.event.domain.model.Event;
import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WishlistService implements ToggleWishlistUseCase, GetWishlistUseCase {
    private final LoadWishlistPort loadWishlistPort;
    private final SaveWishlistPort saveWishlistPort;
    private final DeleteWishlistPort deleteWishlistPort;
    private final LoadEventPort loadEventPort;

    @Override
    @Transactional
    public boolean toggle(Long userId, Long eventId) {
        return loadWishlistPort.findByUserIdAndEventId(userId, eventId)
                .map(item -> {
                    deleteWishlistPort.delete(item.getId());
                    return false; // Removed
                })
                .orElseGet(() -> {
                    WishlistItem item = WishlistItem.create(null, userId, eventId, LocalDateTime.now());
                    saveWishlistPort.save(item);
                    return true; // Added
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WishlistResponse> getWishlist(Long userId, Pageable pageable) {
        return loadWishlistPort.findByUserId(userId, pageable)
                .map(item -> {
                    Event event = loadEventPort.loadEvent(item.getEventId());
                    HostInfo host = loadEventPort.loadHost(event.getCreatorId());
                    return WishlistResponse.of(item, event, host);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkWishlist(Long userId, Long eventId) {
        return loadWishlistPort.exists(userId, eventId);
    }
}
