package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.Session;
import java.time.LocalDateTime;

/**
 * 세션 응답 DTO
 * v6: price 제거, regionSido/regionSigungu 추가, recruitmentStatus/sessionStatus 추가
 * 정원연동: remainingCapacity, isRecruitmentClosed 추가
 */
public record SessionResponse(
    Long id,
    Long eventId,
    String title,
    String description,
    int sortOrder,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    String regionSido,
    String regionSigungu,
    String addressRoad,
    String addressDetail,
    boolean isOnline,
    String onlineLink,
    int maxAttendees,
    int currentAttendees,
    boolean isDefault,
    com.venueon.common.dto.CodeDto recruitmentStatus,
    com.venueon.common.dto.CodeDto sessionStatus,
    LocalDateTime recruitStartDate,
    LocalDateTime recruitEndDate,
    boolean isRecruitmentClosed,
    int remainingCapacity,          // Computed: maxAttendees - currentAttendees (0이면 무제한)
    com.venueon.common.dto.CodeDto forcedRecruitmentStatus,
    com.venueon.common.dto.CodeDto forcedSessionStatus
) {
    public static SessionResponse from(Session session) {
        return new SessionResponse(
            session.getId(),
            session.getEventId(),
            session.getTitle(),
            session.getDescription(),
            session.getSortOrder(),
            session.getStartTime(),
            session.getEndTime(),
            session.getLocation(),
            session.getRegionSido(),
            session.getRegionSigungu(),
            session.getAddressRoad(),
            session.getAddressDetail(),
            session.getIsOnline(),
            session.getOnlineLink(),
            session.getMaxAttendees(),
            session.getCurrentAttendees(),
            session.getIsDefault(),
            session.getRecruitmentStatus() != null ? com.venueon.common.dto.CodeDto.of(session.getRecruitmentStatus().id(), session.getRecruitmentStatus().label()) : null,
            session.getSessionStatus() != null ? com.venueon.common.dto.CodeDto.of(session.getSessionStatus().id(), session.getSessionStatus().label()) : null,
            session.getRecruitStartDate(),
            session.getRecruitEndDate(),
            session.getIsRecruitmentClosed(),
            session.getRemainingCapacity(),
            session.getForcedRecruitmentStatus() != null ? com.venueon.common.dto.CodeDto.of(session.getForcedRecruitmentStatus().id(), session.getForcedRecruitmentStatus().label()) : null,
            session.getForcedSessionStatus() != null ? com.venueon.common.dto.CodeDto.of(session.getForcedSessionStatus().id(), session.getForcedSessionStatus().label()) : null
        );
    }
}

