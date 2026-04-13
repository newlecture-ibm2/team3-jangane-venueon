package com.venueon.common.config;

import com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 개발 전용 — DB 데이터 확인용 임시 컨트롤러
 * dev 프로필에서만 활성화
 */
@RestController
@RequestMapping("/dev")
@Profile("dev")
@RequiredArgsConstructor
public class DevDataController {

    private final UserJpaRepository userRepository;
    private final CategoryJpaRepository categoryRepository;
    private final EventJpaRepository eventRepository;
    private final SessionJpaRepository sessionRepository;

    @GetMapping("/data")
    @Transactional(readOnly = true)
    public Map<String, Object> getAllData() {
        Map<String, Object> result = new HashMap<>();

        // Users
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("email", u.getEmail());
                    map.put("nickname", u.getNickname());
                    map.put("role", u.getRole());
                    return map;
                }).collect(Collectors.toList());

        // Categories
        List<Map<String, Object>> categories = categoryRepository.findAll().stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("name", c.getName());
                    map.put("sortOrder", c.getSortOrder());
                    return map;
                }).collect(Collectors.toList());

        // Events
        List<Map<String, Object>> events = eventRepository.findAll().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", e.getId());
                    map.put("title", e.getTitle());
                    map.put("type", e.getType());
                    map.put("status", e.getStatus());
                    map.put("price", 0); // TODO: Ticket (Phase 3)
                    map.put("creator", e.getCreator().getNickname());
                    map.put("category", e.getCategory().getName());
                    return map;
                }).collect(Collectors.toList());

        // Sessions
        List<Map<String, Object>> sessions = sessionRepository.findAll().stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("eventId", s.getEvent().getId());
                    map.put("title", s.getTitle());
                    map.put("maxAttendees", s.getMaxAttendees());
                    map.put("location", s.isOnline() ? "온라인" : s.getLocation());
                    map.put("recruitStartDate", s.getRecruitStartDate());
                    map.put("recruitEndDate", s.getRecruitEndDate());
                    return map;
                }).collect(Collectors.toList());

        result.put("users", users);
        result.put("userCount", users.size());
        result.put("categories", categories);
        result.put("categoryCount", categories.size());
        result.put("events", events);
        result.put("eventCount", events.size());
        result.put("sessions", sessions);
        result.put("sessionCount", sessions.size());

        return result;
    }
}
