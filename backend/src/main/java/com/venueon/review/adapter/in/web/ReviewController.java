package com.venueon.review.adapter.in.web;
import com.venueon.review.application.port.in.*;
import com.venueon.review.domain.model.Review;
import com.venueon.review.adapter.in.web.dto.ReviewResponse;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;

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
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            Long userId = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                    .getId();
            createReviewUseCase.createReview(userId, eventId, rating, content, image);
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
            String profileUrl = reviewer != null ? (reviewer.getProfileImg() != null ? "/upload/" + reviewer.getProfileImg() : null) : null;
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
    public ResponseEntity<?> checkEligibility(@PathVariable Long eventId, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok(Map.of("success", true, "data", false));
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.venueon.common.exception.BusinessException(com.venueon.common.exception.ErrorCode.UNAUTHORIZED))
                .getId();
        boolean eligible = getReviewsUseCase.hasReviewPermission(userId, eventId);
        return ResponseEntity.ok(Map.of("success", true, "data", eligible));
    }
}
