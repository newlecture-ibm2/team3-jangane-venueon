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
