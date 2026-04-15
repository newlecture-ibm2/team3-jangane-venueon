package com.venueon.admin.event.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.venueon.event.adapter.in.web.dto.SessionResponse;
import com.venueon.common.dto.CodeDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class EventAdminDetailResponse {
    // Event 기본 정보
    private Long id;
    private String title;
    private String description;
    private CodeDto type;
    private CodeDto status;
    private String displayStatus;
    private Long categoryId;
    private String categoryName;
    private String location;
    private boolean isOnline;
    private int price;
    private int maxAttendees;
    private String thumbnailUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean hasSession;
    private CodeDto purchaseType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @JsonProperty("isHidden")
    private boolean isHidden;

    // 주최자 정보
    private HostInfo host;

    // 세션 리스트
    private List<SessionResponse> sessions;

    // 티켓 리스트 (가격 정보 포함)
    private List<TicketInfo> tickets;

    @Getter
    @Builder
    public static class TicketInfo {
        private Long id;
        private String name;
        private int price;
        private int originalPrice;
        private Integer maxQuantity;
        private int soldCount;
        private boolean isActive;
    }

    @Getter
    @Builder
    public static class HostInfo {
        private Long userId;
        private String email;
        private String nickname;
        private String profileImg;
        private String orgName;
        private String orgNumber;
        private String managerName;
        private String orgDescription;
    }
}
