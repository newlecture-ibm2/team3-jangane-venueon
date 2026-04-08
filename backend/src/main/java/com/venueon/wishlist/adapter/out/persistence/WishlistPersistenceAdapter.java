package com.venueon.wishlist.adapter.out.persistence;
import com.venueon.wishlist.application.port.out.LoadWishlistPort;
import com.venueon.wishlist.application.port.out.SaveWishlistPort;
import com.venueon.wishlist.application.port.out.DeleteWishlistPort;
import com.venueon.wishlist.domain.model.WishlistItem;
import com.venueon.wishlist.adapter.out.persistence.entity.WishlistJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WishlistPersistenceAdapter implements LoadWishlistPort, SaveWishlistPort, DeleteWishlistPort {
    private final WishlistRepository repository;

    private WishlistItem mapToDomain(WishlistJpaEntity entity) {
        if (entity == null) return null;
        return WishlistItem.create(entity.getId(), entity.getUserId(), entity.getEventId(), entity.getCreatedAt());
    }

    private WishlistJpaEntity mapToEntity(WishlistItem domain) {
        return WishlistJpaEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .eventId(domain.getEventId())
                .build();
    }

    @Override
    public Optional<WishlistItem> findByUserIdAndEventId(Long userId, Long eventId) {
        return repository.findByUserIdAndEventId(userId, eventId).map(this::mapToDomain);
    }

    @Override
    public Page<WishlistItem> findByUserId(Long userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable).map(this::mapToDomain);
    }

    @Override
    public boolean exists(Long userId, Long eventId) {
        return repository.existsByUserIdAndEventId(userId, eventId);
    }

    @Override
    public WishlistItem save(WishlistItem wishlistItem) {
        WishlistJpaEntity saved = repository.save(mapToEntity(wishlistItem));
        return mapToDomain(saved);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
