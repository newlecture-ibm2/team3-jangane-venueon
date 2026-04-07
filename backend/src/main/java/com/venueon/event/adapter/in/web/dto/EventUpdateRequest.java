package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.application.port.in.UpdateEventUseCase.UpdateEventCommand;
import com.venueon.event.domain.model.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record EventUpdateRequest(
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
    public UpdateEventCommand toCommand(Long eventId, Long requesterId, String requesterRole) {
        return new UpdateEventCommand(
                eventId,
                requesterId,
                requesterRole,
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
