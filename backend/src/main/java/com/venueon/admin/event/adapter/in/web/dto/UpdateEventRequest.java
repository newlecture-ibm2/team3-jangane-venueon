package com.venueon.admin.event.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateEventRequest {
    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    private String description;

    @NotNull(message = "카테고리 ID는 필수입니다.")
    private Long categoryId;

    private String location;
    private boolean isOnline;
    private int price;
    private int maxAttendees;
    private String thumbnailUrl;
}
