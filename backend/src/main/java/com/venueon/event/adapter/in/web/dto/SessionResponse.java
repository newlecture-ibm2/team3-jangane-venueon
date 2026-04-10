package com.venueon.event.adapter.in.web.dto;

import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.RecruitmentStatus;
import com.venueon.event.domain.model.Session;
import java.time.LocalDateTime;

/**
 * 세션 응답 DTO
 * v6: price 제거, regionSido/regionSigungu 추가, recruitmentStatus/sessionStatus 추가
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
    boolean isOnline,
    String onlineLink,
    int maxAttendees,
    int currentAttendees,
    boolean isDefault,
    RecruitmentStatus recruitmentStatus,
    EventStatus sessionStatus,
    LocalDateTime recruitStartDate,
    LocalDateTime recruitEndDate
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
            session.getIsOnline(),
            session.getOnlineLink(),
            session.getMaxAttendees(),
            session.getCurrentAttendees(),
            session.getIsDefault(),
            session.getRecruitmentStatus(),
            session.getSessionStatus(),
            session.getRecruitStartDate(),
            session.getRecruitEndDate()
        );
    }
}
