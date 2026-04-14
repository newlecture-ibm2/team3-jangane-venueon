package com.venueon.admin.event.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.venueon.common.dto.CodeDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EventAdminResponse {
    private Long id;
    private String title;
    private int currentAttendees;
    private LocalDateTime createdAt;
    private CodeDto status;
    private String displayStatus;
    private Long categoryId;
    private String categoryName;

    @JsonProperty("isHidden")
    private boolean isHidden;
}
