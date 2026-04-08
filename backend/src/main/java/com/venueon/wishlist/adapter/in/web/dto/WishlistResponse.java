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
    private String status;
    private String title;
    private String organizer;
    private String dateTime;
    private String location;
    private int price;
    private Long wishlistId;

    public static WishlistResponse of(WishlistItem item, Event event, HostInfo host) {
        String eventStatus = event.getStatus() != null ? event.getStatus().name() : "ONGOING";
        String organizerName = (host != null && host.nickname() != null) ? host.nickname() : "알 수 없는 호스트";
        String dateStr = event.getStartDate() != null ? event.getStartDate().format(DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm")) : "-";
        
        return WishlistResponse.builder()
            .id(event.getId())
            .wishlistId(item.getId())
            .status(eventStatus)
            .title(event.getTitle())
            .organizer(organizerName)
            .dateTime(dateStr)
            .location(event.getLocation() != null ? event.getLocation() : "온라인")
            .price(event.getPrice())
            .build();
    }
}
