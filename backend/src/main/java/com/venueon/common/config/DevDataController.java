package com.venueon.common.config;

import com.venueon.event.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.CategoryJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
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
                    map.put("role", u.getRole().name());
                    map.put("orgName", u.getOrgName());
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
                    map.put("type", e.getType().name());
                    map.put("status", e.getStatus().name());
                    map.put("price", e.getPrice());
                    map.put("maxAttendees", e.getMaxAttendees());
                    map.put("location", e.getLocation());
                    map.put("creator", e.getCreator().getNickname());
                    map.put("category", e.getCategory().getName());
                    return map;
                }).collect(Collectors.toList());

        result.put("users", users);
        result.put("userCount", users.size());
        result.put("categories", categories);
        result.put("categoryCount", categories.size());
        result.put("events", events);
        result.put("eventCount", events.size());

        return result;
    }
}
