#!/bin/bash
DIR="backend/src/main/java/com/venueon/review"
mkdir -p $DIR/domain/model $DIR/application/port/in $DIR/application/port/out $DIR/application/service
mkdir -p $DIR/adapter/out/persistence/entity $DIR/adapter/in/web/dto

# 1. Domain
cat << 'JAVA' > $DIR/domain/model/Review.java
package com.venueon.review.domain.model;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {
    private Long id;
    private Long eventId;
    private Long reviewerId;
    private int rating;
    private String content;
    private String images;
    private LocalDateTime createdAt;
}
JAVA

# 2. Ports In
cat << 'JAVA' > $DIR/application/port/in/CreateReviewUseCase.java
package com.venueon.review.application.port.in;
import com.venueon.review.domain.model.Review;
import org.springframework.web.multipart.MultipartFile;
public interface CreateReviewUseCase {
    Review createReview(Long userId, Long eventId, int rating, String content, MultipartFile image);
}
JAVA

cat << 'JAVA' > $DIR/application/port/in/GetReviewsUseCase.java
package com.venueon.review.application.port.in;
import com.venueon.review.domain.model.Review;
import java.util.List;
public interface GetReviewsUseCase {
    List<Review> getReviewsByEventId(Long eventId);
    boolean hasReviewPermission(Long userId, Long eventId);
}
JAVA

# 3. Port Out
cat << 'JAVA' > $DIR/application/port/out/ReviewRepositoryPort.java
package com.venueon.review.application.port.out;
import com.venueon.review.domain.model.Review;
import java.util.List;
public interface ReviewRepositoryPort {
    Review save(Review review);
    List<Review> findByEventId(Long eventId);
    boolean existsByEventIdAndReviewerId(Long eventId, Long reviewerId);
}
JAVA

# 4. Persistence
cat << 'JAVA' > $DIR/adapter/out/persistence/entity/ReviewJpaEntity.java
package com.venueon.review.adapter.out.persistence.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewJpaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long eventId;
    private Long reviewerId;
    private int rating;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String images;
    private LocalDateTime createdAt;
}
JAVA

cat << 'JAVA' > $DIR/adapter/out/persistence/ReviewJpaRepository.java
package com.venueon.review.adapter.out.persistence;
import com.venueon.review.adapter.out.persistence.entity.ReviewJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReviewJpaRepository extends JpaRepository<ReviewJpaEntity, Long> {
    List<ReviewJpaEntity> findAllByEventIdOrderByCreatedAtDesc(Long eventId);
    boolean existsByEventIdAndReviewerId(Long eventId, Long reviewerId);
}
JAVA

cat << 'JAVA' > $DIR/adapter/out/persistence/ReviewAdapter.java
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
JAVA

# 5. Service
cat << 'JAVA' > $DIR/application/service/ReviewService.java
package com.venueon.review.application.service;
import com.venueon.review.application.port.in.*;
import com.venueon.review.application.port.out.ReviewRepositoryPort;
import com.venueon.review.domain.model.Review;
import com.venueon.common.annotation.UseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import com.venueon.order.adapter.out.persistence.OrderJpaRepository;

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
        return orderRepository.existsByEventIdAndUserIdAndStatus(eventId, userId, com.venueon.order.domain.model.OrderStatus.COMPLETED);
    }
}
JAVA

# 6. Web Adapter
cat << 'JAVA' > $DIR/adapter/in/web/dto/ReviewResponse.java
package com.venueon.review.adapter.in.web.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class ReviewResponse {
    private Long id;
    private String authorName;
    private String authorProfileUrl;
    private int rating;
    private String content;
    private List<String> images;
    private String date;
}
JAVA

cat << 'JAVA' > $DIR/adapter/in/web/ReviewController.java
package com.venueon.review.adapter.in.web;
import com.venueon.review.application.port.in.*;
import com.venueon.review.domain.model.Review;
import com.venueon.review.adapter.in.web.dto.ReviewResponse;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.common.security.annotation.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;

@RestController @RequestMapping("/events/{eventId}/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final CreateReviewUseCase createReviewUseCase;
    private final GetReviewsUseCase getReviewsUseCase;
    private final UserRepositoryPort userRepository;

    @PostMapping
    public ResponseEntity<?> createReview(
            @PathVariable Long eventId,
            @RequestParam("rating") int rating,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) MultipartFile image,
            @CurrentUser User user) {
        try {
            createReviewUseCase.createReview(user.getId(), eventId, rating, content, image);
            return ResponseEntity.ok(Map.of("success", true, "message", "리뷰가 등록되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getReviews(@PathVariable Long eventId) {
        List<Review> reviews = getReviewsUseCase.getReviewsByEventId(eventId);
        List<ReviewResponse> responses = reviews.stream().map(r -> {
            User reviewer = userRepository.findById(r.getReviewerId()).orElse(null);
            String authorName = reviewer != null ? reviewer.getNickname() : "알 수 없음";
            String profileUrl = reviewer != null ? (reviewer.getProfileImage() != null ? "/upload/" + reviewer.getProfileImage() : null) : null;
            return ReviewResponse.builder()
                    .id(r.getId())
                    .authorName(authorName)
                    .authorProfileUrl(profileUrl)
                    .rating(r.getRating())
                    .content(r.getContent())
                    .images(r.getImages() != null ? List.of("/upload/" + r.getImages()) : null)
                    .date(r.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "data", responses));
    }
    
    @GetMapping("/can-review")
    public ResponseEntity<?> checkEligibility(@PathVariable Long eventId, @CurrentUser User user) {
        if (user == null) return ResponseEntity.ok(Map.of("success", true, "data", false));
        boolean eligible = getReviewsUseCase.hasReviewPermission(user.getId(), eventId);
        return ResponseEntity.ok(Map.of("success", true, "data", eligible));
    }
}
JAVA

