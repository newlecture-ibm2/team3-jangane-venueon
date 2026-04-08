package com.venueon.wishlist.adapter.out.persistence;
import com.venueon.wishlist.adapter.out.persistence.entity.WishlistJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistJpaEntity, Long> {
    Optional<WishlistJpaEntity> findByUserIdAndEventId(Long userId, Long eventId);
    Page<WishlistJpaEntity> findByUserId(Long userId, Pageable pageable);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
}
