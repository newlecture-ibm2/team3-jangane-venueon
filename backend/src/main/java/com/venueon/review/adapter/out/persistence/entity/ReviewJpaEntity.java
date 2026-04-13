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
