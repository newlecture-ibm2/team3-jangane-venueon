package com.venueon.community.adapter.in.web;

import com.venueon.community.application.port.in.dto.CommunityResponse;
import com.venueon.community.application.port.in.dto.CreateCommunityRequest;
import com.venueon.community.application.port.in.dto.UpdateCommunityRequest;
import com.venueon.community.application.port.in.CreateCommunityUseCase;
import com.venueon.community.application.port.in.UpdateCommunityUseCase;
import com.venueon.community.application.port.in.GetCommunityQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CreateCommunityUseCase createCommunityUseCase;
    private final UpdateCommunityUseCase updateCommunityUseCase;
    private final GetCommunityQuery getCommunityQuery;

    /**
     * 커뮤니티 생성
     * POST /communities
     */
    @PostMapping
    public ResponseEntity<CommunityResponse> createCommunity(
            @RequestBody CreateCommunityRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = "admin@venueon.com"; // 기본값 (비회원 익명작성용)
        
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        CommunityResponse response = createCommunityUseCase.createCommunity(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 공개 커뮤니티 목록 조회
     * GET /communities
     */
    @GetMapping
    public ResponseEntity<?> getCommunities(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<CommunityResponse> communities = getCommunityQuery.getPublicCommunities(pageable);
            return ResponseEntity.ok(communities);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving communities: " + e.getMessage() + "\n" + sw.toString());
        }
    }

    /**
     * 커뮤니티 단건 조회
     * GET /communities/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponse> getCommunity(@PathVariable Long id) {
        CommunityResponse response = getCommunityQuery.getCommunityById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 커뮤니티 수정
     * PUT /communities/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CommunityResponse> updateCommunity(
            @PathVariable Long id,
            @RequestBody UpdateCommunityRequest request) {

        CommunityResponse response = updateCommunityUseCase.updateCommunity(id, request);
        return ResponseEntity.ok(response);
    }
}
