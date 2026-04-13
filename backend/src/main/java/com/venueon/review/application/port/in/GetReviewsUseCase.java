package com.venueon.review.application.port.in;
import com.venueon.review.domain.model.Review;
import java.util.List;
public interface GetReviewsUseCase {
    List<Review> getReviewsByEventId(Long eventId);
    boolean hasReviewPermission(Long userId, Long eventId);
}
