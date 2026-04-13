package com.venueon.review.application.port.out;
import com.venueon.review.domain.model.Review;
import java.util.List;
public interface ReviewRepositoryPort {
    Review save(Review review);
    List<Review> findByEventId(Long eventId);
    boolean existsByEventIdAndReviewerId(Long eventId, Long reviewerId);
}
