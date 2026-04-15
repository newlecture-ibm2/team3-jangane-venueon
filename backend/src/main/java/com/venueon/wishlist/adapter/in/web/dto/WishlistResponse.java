package com.venueon.wishlist.adapter.in.web.dto;
import com.venueon.event.domain.model.Event;
import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import com.venueon.wishlist.domain.model.WishlistItem;
import lombok.Getter;
import lombok.Builder;
import java.time.format.DateTimeFormatter;

@Getter @Builder
public class WishlistResponse {
    private Long id;
    private com.venueon.common.dto.CodeDto status;
    private com.venueon.common.dto.CodeDto recruitmentStatus;
    private Long categoryId;
    private String thumbnailUrl;
    private String title;
    private String organizer;
    private String dateTime;
    private String location;
    private int price;
    private Long wishlistId;

    public static WishlistResponse of(WishlistItem item, Event event, HostInfo host, 
        java.util.List<com.venueon.event.domain.model.Session> sessions, 
        java.util.List<com.venueon.ticket.domain.model.Ticket> tickets) {
        
        com.venueon.common.dto.CodeDto eventStatus = event.getStatus() != null ? 
            com.venueon.common.dto.CodeDto.of(event.getStatus().id(), event.getStatus().label()) : 
            com.venueon.common.dto.CodeDto.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID, "진행중");
            
        com.venueon.common.model.DomainCode recruitCode = event.getRecruitmentStatus(sessions);
        com.venueon.common.dto.CodeDto recruitStatusDto = recruitCode != null ? 
            com.venueon.common.dto.CodeDto.of(recruitCode.id(), recruitCode.label()) : null;

        String organizerName = (host != null && host.nickname() != null) ? host.nickname() : "알 수 없는 호스트";
        
        // 날짜/장소는 첫 번째 세션 기준
        String dateStr = "-";
        String locStr = "-";
        if (sessions != null && !sessions.isEmpty()) {
            java.time.LocalDateTime startDate = event.getStartDate(sessions);
            if (startDate != null) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy년 M월 d일 a h시").withLocale(java.util.Locale.KOREAN);
                dateStr = startDate.format(formatter);
            }
            // 장소 (오프라인이면 location, 온라인이면 온라인)
            com.venueon.event.domain.model.Session firstSession = sessions.get(0);
            locStr = firstSession.getIsOnline() ? "온라인 진행" : (firstSession.getLocation() != null ? firstSession.getLocation() : "-");
        }

        // 가격은 첫 번째 티켓 기준
        int minPrice = 0;
        if (tickets != null && !tickets.isEmpty()) {
            minPrice = tickets.get(0).getPrice();
        }

        return WishlistResponse.builder()
            .id(event.getId())
            .wishlistId(item.getId())
            .status(eventStatus)
            .recruitmentStatus(recruitStatusDto)
            .categoryId(event.getCategoryId())
            .thumbnailUrl(event.getThumbnailUrl())
            .title(event.getTitle())
            .organizer(organizerName)
            .dateTime(dateStr)
            .location(locStr)
            .price(minPrice)
            .build();
    }
}
