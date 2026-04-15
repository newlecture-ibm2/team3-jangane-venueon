package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.application.port.in.CreateEventUseCase.CreateEventCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 이벤트 생성 요청 DTO
 * v6: price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거
 */
public record EventCreateRequest(
        Long categoryId,

        @NotBlank(message = "제목은 필수입니다.")
        String title,

        String description,
        
        String detailContent,

        Long typeId,

        String thumbnailUrl,

        boolean hasSession,
        List<SessionCreateRequest> sessions
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
                detailContent,
                typeId,
                thumbnailUrl,
                hasSession,
                sessions
        );
    }
}
