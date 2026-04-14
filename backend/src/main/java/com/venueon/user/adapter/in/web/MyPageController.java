package com.venueon.user.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.user.adapter.in.web.dto.MyPageSummaryResponse;
import com.venueon.user.application.port.in.GetMyPageSummaryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final GetMyPageSummaryUseCase getMyPageSummaryUseCase;

    /**
     * 프론트엔드 대시보드에서 사용하는 마이페이지 상단 요약 데이터 API
     * GET /mypage/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MyPageSummaryResponse>> getMyPageSummary(Authentication authentication) {
        // 인증 정보가 없는 경우(JWT 미제공) 개발용 기본 이메일 사용
        String email = (authentication != null) ? authentication.getName() : "user1@example.com";
        MyPageSummaryResponse response = getMyPageSummaryUseCase.getSummary(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
