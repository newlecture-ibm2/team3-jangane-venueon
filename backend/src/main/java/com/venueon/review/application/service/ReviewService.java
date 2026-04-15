package com.venueon.review.application.service;

import com.venueon.review.application.port.in.*;
import com.venueon.review.application.port.out.ReviewRepositoryPort;
import com.venueon.review.domain.model.Review;
import com.venueon.common.annotation.UseCase;
import com.venueon.order.application.port.out.OrderRepositoryPort;
import com.venueon.order.domain.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 리뷰 서비스 — Port 인터페이스만 의존 (JPA 직접 참조 제거)
 */
@Slf4j
@UseCase
@RequiredArgsConstructor
public class ReviewService implements CreateReviewUseCase, GetReviewsUseCase {

    private final ReviewRepositoryPort reviewRepository;
    private final OrderRepositoryPort orderRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

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
            try {
                String originalName = image.getOriginalFilename();
                String ext = "";
                if (originalName != null && originalName.contains(".")) {
                    ext = originalName.substring(originalName.lastIndexOf("."));
                }
                String savedFileName = UUID.randomUUID() + ext;

                LocalDate now = LocalDate.now();
                String yearMonth = now.getYear() + "/" + String.format("%02d", now.getMonthValue());

                String resolved = uploadDir.startsWith("~")
                        ? System.getProperty("user.home") + uploadDir.substring(1)
                        : uploadDir;
                Path categoryDir = Paths.get(resolved).toAbsolutePath().normalize()
                        .resolve("review")
                        .resolve(yearMonth);
                Files.createDirectories(categoryDir);

                Path targetPath = categoryDir.resolve(savedFileName);
                image.transferTo(targetPath.toFile());

                imagePath = "review/" + yearMonth + "/" + savedFileName;
                log.info("리뷰 이미지 저장 완료: {}", imagePath);
            } catch (Exception e) {
                log.error("리뷰 이미지 저장 실패", e);
                // 이미지 저장 실패해도 리뷰 텍스트는 저장
            }
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
        
        // 1. 유효한 주문(결제/신청)이 있는지 확인
        boolean hasOrder = !orderRepository.findByUserIdAndEventIdAndStatusIn(userId, eventId,
                List.of(OrderStatus.PAID, OrderStatus.REGISTERED)).isEmpty();
                
        // 2. 이미 리뷰를 작성했는지 확인
        boolean alreadyReviewed = reviewRepository.existsByEventIdAndReviewerId(eventId, userId);
        
        // 두 조건을 모두 만족해야 리뷰 작성 권한이 있음 (등록된 사용자이고, 아직 리뷰를 작성하지 않음)
        return hasOrder && !alreadyReviewed;
    }
}

