package com.venueon.review.application.port.in;
import com.venueon.review.domain.model.Review;
import org.springframework.web.multipart.MultipartFile;
public interface CreateReviewUseCase {
    Review createReview(Long userId, Long eventId, int rating, String content, MultipartFile image);
}
