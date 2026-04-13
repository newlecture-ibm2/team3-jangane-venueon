package com.venueon.review.adapter.out.persistence;
import com.venueon.review.application.port.out.ReviewRepositoryPort;
import com.venueon.review.domain.model.Review;
import com.venueon.review.adapter.out.persistence.entity.ReviewJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component @RequiredArgsConstructor
public class ReviewAdapter implements ReviewRepositoryPort {
    private final ReviewJpaRepository repository;
    
    private Review toDomain(ReviewJpaEntity entity) {
        return Review.builder().id(entity.getId()).eventId(entity.getEventId())
                .reviewerId(entity.getReviewerId()).rating(entity.getRating())
                .content(entity.getContent()).images(entity.getImages())
                .createdAt(entity.getCreatedAt()).build();
    }
    private ReviewJpaEntity toEntity(Review review) {
        return ReviewJpaEntity.builder().id(review.getId()).eventId(review.getEventId())
                .reviewerId(review.getReviewerId()).rating(review.getRating())
                .content(review.getContent()).images(review.getImages())
                .createdAt(review.getCreatedAt()).build();
    }
    
    @Override public Review save(Review review) {
        return toDomain(repository.save(toEntity(review)));
    }
    @Override public List<Review> findByEventId(Long eventId) {
        return repository.findAllByEventIdOrderByCreatedAtDesc(eventId).stream().map(this::toDomain).collect(Collectors.toList());
    }
    @Override public boolean existsByEventIdAndReviewerId(Long eventId, Long reviewerId) {
        return repository.existsByEventIdAndReviewerId(eventId, reviewerId);
    }
}
