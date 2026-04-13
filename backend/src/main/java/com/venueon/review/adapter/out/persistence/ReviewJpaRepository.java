package com.venueon.review.adapter.out.persistence;
import com.venueon.review.adapter.out.persistence.entity.ReviewJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReviewJpaRepository extends JpaRepository<ReviewJpaEntity, Long> {
    List<ReviewJpaEntity> findAllByEventIdOrderByCreatedAtDesc(Long eventId);
    boolean existsByEventIdAndReviewerId(Long eventId, Long reviewerId);
}
