package com.venueon.order.adapter.in.web.dto;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;

import java.time.format.DateTimeFormatter;

/**
 * 마이페이지 "내 강의 목록" 응답 DTO
 * 프론트 Card 컴포넌트에 맞는 필드 구성
 */
public record MyOrderResponse(
        Long orderId,
        String status,
        String title,
        String organizer,
        String dateTime,
        String location,
        int price,
        Long eventId
) {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    /**
     * JPA 엔티티 → DTO 변환 (Lazy 로딩 대비 fetch join 필수)
     */
    public static MyOrderResponse from(OrderJpaEntity order) {
        EventJpaEntity event = order.getEvent();

        com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity session = order.getSession();
        
        String dateRange = "";
        String loc = "-";

        if (session != null) {
            if (session.getStartTime() != null && session.getEndTime() != null) {
                dateRange = session.getStartTime().format(FMT) + " ~ " + session.getEndTime().format(FMT);
            }
            loc = session.isOnline() ? "온라인" : (session.getLocation() != null ? session.getLocation() : "미정");
        }

        String statusLabel = mapStatus(order.getStatus().name(), event.getStatus().name());

        return new MyOrderResponse(
                order.getId(),
                statusLabel,
                event.getTitle(),
                event.getCreator().getNickname(),
                dateRange,
                loc,
                0, // price는 Phase 3에서 Ticket 기반으로 변경
                event.getId()
        );
    }

    /**
     * 주문 상태 + 이벤트 상태 조합 → 프론트 탭 라벨
     *
     * 수강 예정: 주문 유효(PAID/REGISTERED) + 이벤트 아직 시작 전(DRAFT/PUBLISHED)
     * 수강 중  : 주문 유효 + 이벤트 진행 중(ONGOING)
     * 수강 완료: 주문 유효 + 이벤트 종료(ENDED) 또는 주문 취소/환불
     */
    private static String mapStatus(String orderStatus, String eventStatus) {
        return switch (orderStatus) {
            case "CANCELLED", "REFUNDED" -> "종료";
            default -> switch (eventStatus) {
                case "DRAFT", "PUBLISHED" -> "모집 중";
                case "ONGOING" -> "진행 중";
                case "ENDED", "CANCELLED" -> "종료";
                default -> "준비 중";
            };
        };
    }
}
