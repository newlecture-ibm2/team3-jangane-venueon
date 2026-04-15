package com.venueon.review.adapter.in.web.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long authorId;
    private String authorName;
    private String authorProfileUrl;
    private int rating;
    private String content;
    private List<String> images;
    private String date;
}
