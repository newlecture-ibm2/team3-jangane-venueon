package com.venueon;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;

@RestController
public class BadgeDebugController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/debug/badges")
    public List<Map<String, Object>> debugBadges() {
        return jdbcTemplate.queryForList("SELECT o.id as order_id, o.status, o.event_id, o.ticket_id, t.is_all_sessions " +
            "FROM orders o LEFT JOIN tickets t ON o.ticket_id = t.id " +
            "WHERE o.user_id = 2 AND o.status IN ('PAID', 'REGISTERED')");
    }
    
    @GetMapping("/api/debug/sessions")
    public List<Map<String, Object>> debugSessions() {
        return jdbcTemplate.queryForList("SELECT id, event_id, end_time FROM sessions");
    }
}
