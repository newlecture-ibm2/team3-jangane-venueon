package com.venueon.admin.community.adapter.in.web;

import com.venueon.admin.community.application.port.in.GetAdminPostListUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequiredArgsConstructor
public class TestDebugController {
    
    private final GetAdminPostListUseCase useCase;

    @GetMapping("/testdebugposts")
    public ResponseEntity<?> test() {
        try {
            return ResponseEntity.ok(useCase.getPosts(null, null, null, PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))));
        } catch (Throwable t) {
            StringBuilder sb = new StringBuilder();
            Throwable current = t;
            while(current != null) {
                sb.append(current.toString()).append("\n");
                current = current.getCause();
            }
            return ResponseEntity.status(500).body(sb.toString());
        }
    }
}
