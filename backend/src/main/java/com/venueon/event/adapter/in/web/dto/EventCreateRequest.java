package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.application.port.in.CreateEventUseCase.CreateEventCommand;
import com.venueon.event.domain.model.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * 이벤트 생성 요청 DTO
 */
public record EventCreateRequest(
        Long categoryId,

        @NotBlank(message = "제목은 필수입니다.")
        String title,

        String description,

        @NotNull(message = "이벤트 유형은 필수입니다.")
        EventType type,

        String location,
        boolean isOnline,
        int price,
        int maxAttendees,
        String thumbnailUrl,

        @NotNull(message = "시작일은 필수입니다.")
        LocalDateTime startDate,

        @NotNull(message = "종료일은 필수입니다.")
        LocalDateTime endDate
) {
    /**
     * DTO → UseCase Command 변환
     */
    public CreateEventCommand toCommand(Long creatorId) {
        return new CreateEventCommand(
                creatorId,
                categoryId,
                title,
                description,
                type,
                location,
                isOnline,
                price,
                maxAttendees,
                thumbnailUrl,
                startDate,
                endDate
        );
    }
}
