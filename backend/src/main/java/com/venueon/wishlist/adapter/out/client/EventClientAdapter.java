package com.venueon.wishlist.adapter.out.client;
import com.venueon.wishlist.application.port.out.LoadEventPort;
import com.venueon.event.application.service.EventQueryService;
import com.venueon.event.domain.model.Event;
import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventClientAdapter implements LoadEventPort {
    private final EventQueryService eventQueryService;
    
    @Override
    public Event loadEvent(Long eventId) {
        return eventQueryService.getEventById(eventId);
    }
    
    @Override
    public HostInfo loadHost(Long creatorId) {
        return eventQueryService.getHostInfoByCreatorId(creatorId);
    }
}
