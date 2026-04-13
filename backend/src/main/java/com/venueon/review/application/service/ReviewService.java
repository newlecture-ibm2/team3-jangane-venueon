package com.venueon.review.application.service;
import com.venueon.review.application.port.in.*;
import com.venueon.review.application.port.out.ReviewRepositoryPort;
import com.venueon.review.domain.model.Review;
import com.venueon.common.annotation.UseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;

@UseCase @RequiredArgsConstructor
public class ReviewService implements CreateReviewUseCase, GetReviewsUseCase {
    private final ReviewRepositoryPort reviewRepository;
    private final OrderJpaRepository orderRepository; // to check if they completed order
    // if you have a file service, inject it. We will just save filename for now.
    
    @Override
    public Review createReview(Long userId, Long eventId, int rating, String content, MultipartFile image) {
        if (!hasReviewPermission(userId, eventId)) {
            throw new IllegalArgumentException("이벤트를 수료한 사용자만 리뷰를 작성할 수 있습니다.");
        }
        if (reviewRepository.existsByEventIdAndReviewerId(eventId, userId)) {
            throw new IllegalArgumentException("이미 리뷰를 작성하셨습니다.");
        }
        
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            imagePath = image.getOriginalFilename(); // in real app, save to S3 or disk
        }
        
        Review review = Review.builder().eventId(eventId).reviewerId(userId)
                .rating(rating).content(content).images(imagePath)
                .createdAt(LocalDateTime.now()).build();
                
        return reviewRepository.save(review);
    }
    
    @Override
    public List<Review> getReviewsByEventId(Long eventId) {
        return reviewRepository.findByEventId(eventId);
    }
    
    @Override
    public boolean hasReviewPermission(Long userId, Long eventId) {
        if (userId == null) return false;
        return !orderRepository.findByUserIdAndEventIdAndStatusIn(userId, eventId, 
                List.of(com.venueon.order.domain.model.OrderStatus.PAID, com.venueon.order.domain.model.OrderStatus.REGISTERED)).isEmpty();
    }
}
