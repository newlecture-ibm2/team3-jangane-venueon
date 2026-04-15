package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.application.port.in.UpdateEventUseCase.UpdateEventCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 이벤트 수정 요청 DTO
 * v6: price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거
 */
public record EventUpdateRequest(
        Long categoryId,

        @NotBlank(message = "제목은 필수입니다.")
        String title,

        String description,
        
        String detailContent,

        Long typeId,

        String thumbnailUrl,
        boolean hasSession
) {
    public UpdateEventCommand toCommand(Long eventId, Long requesterId, String requesterRole) {
        return new UpdateEventCommand(
                eventId,
                requesterId,
                requesterRole,
                categoryId,
                title,
                description,
                detailContent,
                typeId,
                thumbnailUrl,
                hasSession
        );
    }
}
