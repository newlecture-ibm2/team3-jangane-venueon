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
    private String title;
    private String organizer;
    private String dateTime;
    private String location;
    private int price;
    private Long wishlistId;

    public static WishlistResponse of(WishlistItem item, Event event, HostInfo host) {
        com.venueon.common.dto.CodeDto eventStatus = event.getStatus() != null ? 
            com.venueon.common.dto.CodeDto.of(event.getStatus().id(), event.getStatus().label()) : 
            com.venueon.common.dto.CodeDto.of(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID, "진행중");
        String organizerName = (host != null && host.nickname() != null) ? host.nickname() : "알 수 없는 호스트";
        // v6: startDate, location, price는 Session/Ticket으로 이동
        String dateStr = "-"; // TODO: Session 기반으로 변경
        
        return WishlistResponse.builder()
            .id(event.getId())
            .wishlistId(item.getId())
            .status(eventStatus)
            .title(event.getTitle())
            .organizer(organizerName)
            .dateTime(dateStr)
            .location("-") // TODO: Session 기반으로 변경
            .price(0) // TODO: Ticket 기반으로 변경
            .build();
    }
}
