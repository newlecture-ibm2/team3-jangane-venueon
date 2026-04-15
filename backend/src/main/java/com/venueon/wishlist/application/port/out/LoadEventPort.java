package com.venueon.wishlist.application.port.out;
import com.venueon.event.domain.model.Event;
import com.venueon.event.application.port.out.LoadHostInfoPort.HostInfo;
public interface LoadEventPort {
    Event loadEvent(Long eventId);
    HostInfo loadHost(Long creatorId);
    java.util.List<com.venueon.event.domain.model.Session> loadSessions(Long eventId);
    java.util.List<com.venueon.ticket.domain.model.Ticket> loadTickets(Long eventId);
}
