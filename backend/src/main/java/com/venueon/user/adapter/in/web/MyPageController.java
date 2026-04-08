package com.venueon.user.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import com.venueon.user.adapter.in.web.dto.MyPageSummaryResponse;
import com.venueon.user.application.port.in.GetMyPageSummaryUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mypage")
public class MyPageController {

    private final GetMyPageSummaryUseCase getMyPageSummaryUseCase;

    public MyPageController(GetMyPageSummaryUseCase getMyPageSummaryUseCase) {
        this.getMyPageSummaryUseCase = getMyPageSummaryUseCase;
    }

    /**
     * 프론트엔드 대시보드에서 사용하는 마이페이지 상단 요약 데이터 API
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MyPageSummaryResponse>> getMyPageSummary(@AuthenticationPrincipal Long userId) {
        // 인증 객체에서 유저 ID를 안전하게 파싱 (임시로 1L 세팅 시큐리티 구조에 따라 수정 요망)
        Long currentUserId = userId != null ? userId : 1L; 
        
        MyPageSummaryResponse response = getMyPageSummaryUseCase.getSummary(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
