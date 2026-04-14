package com.venueon.order.adapter.in.web.dto;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;

import java.time.format.DateTimeFormatter;

/**
 * 마이페이지 "내 강의 목록" 응답 DTO
 * 프론트 Card 컴포넌트에 맞는 필드 구성
 *
 * v6: session 기반 → ticket 기반 전환
 */
public record MyOrderResponse(
        Long orderId,
        String status,
        String title,
        String organizer,
        String ticketName,
        int price,
        Long eventId
) {
    /**
     * JPA 엔티티 → DTO 변환 (Lazy 로딩 대비 fetch join 필수)
     */
    public static MyOrderResponse from(OrderJpaEntity order) {
        EventJpaEntity event = order.getEvent();
        TicketJpaEntity ticket = order.getTicket();

        String ticketLabel = ticket != null ? ticket.getName() : "-";
        int ticketPrice = ticket != null ? ticket.getPrice() : 0;

        String statusLabel = mapStatus(order.getStatus().name(), event.getStatus() != null ? event.getStatus().getId() : com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID);

        return new MyOrderResponse(
                order.getId(),
                statusLabel,
                event.getTitle(),
                event.getCreator().getNickname(),
                ticketLabel,
                ticketPrice,
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
    private static String mapStatus(String orderStatus, Long eventStatusId) {
        return switch (orderStatus) {
            case "CANCELLED", "REFUNDED" -> "종료";
            default -> {
                if (eventStatusId == null) yield "준비 중";
                if (eventStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_DRAFT_ID) || eventStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_PUBLISHED_ID)) yield "모집 중";
                if (eventStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ONGOING_ID)) yield "진행 중";
                if (eventStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_ENDED_ID) || eventStatusId.equals(com.venueon.common.model.CodeConstants.EVENT_STATUS_CANCELLED_ID)) yield "종료";
                yield "준비 중";
            }
        };
    }
}
