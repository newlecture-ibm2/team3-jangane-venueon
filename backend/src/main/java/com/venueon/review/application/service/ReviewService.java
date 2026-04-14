package com.venueon.review.application.service;

import com.venueon.review.application.port.in.*;
import com.venueon.review.application.port.out.ReviewRepositoryPort;
import com.venueon.review.domain.model.Review;
import com.venueon.common.annotation.UseCase;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.domain.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 리뷰 서비스 — Port 인터페이스만 의존 (JPA 직접 참조 제거)
 */
@UseCase
@RequiredArgsConstructor
public class ReviewService implements CreateReviewUseCase, GetReviewsUseCase {

    private final ReviewRepositoryPort reviewRepository;
    private final OrderRepositoryPort orderRepository;

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
            imagePath = image.getOriginalFilename();
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
                List.of(OrderStatus.PAID, OrderStatus.REGISTERED)).isEmpty();
    }
}
