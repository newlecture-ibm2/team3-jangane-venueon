package com.venueon.order.application.service;

import com.venueon.common.annotation.UseCase;
import com.venueon.common.exception.BusinessException;
import com.venueon.common.exception.ErrorCode;
import com.venueon.order.adapter.in.web.dto.MyOrderResponse;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.application.port.in.GetMyOrdersUseCase;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@UseCase
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService implements GetMyOrdersUseCase {

    private final OrderJpaRepository orderJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public Page<MyOrderResponse> getMyOrders(String email, String tab, Pageable pageable) {
        log.debug("내 강의 목록 조회: email={}, tab={}", email, tab);

        // 1) 이메일로 사용자 조회
        UserJpaEntity user = userJpaRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        // 2) fetch join으로 전체 주문+이벤트 로드 (N+1 방지)
        List<OrderJpaEntity> allOrders = orderJpaRepository.findByUserIdWithEvent(user.getId());

        // 3) DTO 변환
        List<MyOrderResponse> allDtos = allOrders.stream()
                .map(MyOrderResponse::from)
                .toList();

        // 4) 탭별 필터링
        List<MyOrderResponse> filtered = filterByTab(allDtos, tab);

        // 5) 수동 페이지네이션 (fetch join + Page 동시 사용 불가)
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        List<MyOrderResponse> pageContent = start >= filtered.size()
                ? List.of()
                : filtered.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    /**
     * 프론트 탭에 맞는 status 라벨 필터링
     */
    private List<MyOrderResponse> filterByTab(List<MyOrderResponse> dtos, String tab) {
        if (tab == null || tab.isBlank()) {
            return dtos;
        }

        Set<String> acceptedStatuses = switch (tab) {
            case "upcoming" -> Set.of("모집 중", "준비 중");
            case "enrolled" -> Set.of("진행 중");
            case "completed" -> Set.of("종료");
            default -> Set.of(); // 빈 셋 → 전부 반환
        };

        if (acceptedStatuses.isEmpty()) {
            return dtos;
        }

        return dtos.stream()
                .filter(dto -> acceptedStatuses.contains(dto.status()))
                .toList();
    }
}
