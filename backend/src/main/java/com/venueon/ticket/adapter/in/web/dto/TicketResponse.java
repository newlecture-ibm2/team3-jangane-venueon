package com.venueon.ticket.adapter.in.web.dto;

import com.venueon.event.domain.model.RecruitmentStatus;
import com.venueon.event.domain.model.Session;
import com.venueon.ticket.domain.model.Ticket;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 티켓 조회 응답 DTO
 * 정원연동: isPurchasable, unavailableReason, recruitEndDate 추가
 */
public record TicketResponse(
        Long id,
        String name,
        String description,
        int price,
        int originalPrice,
        int discountRate,
        boolean isAllSessions,
        Integer maxQuantity,
        int soldCount,
        Integer remainingQuantity,
        boolean isOnSale,
        boolean isActive,
        LocalDateTime salesStart,
        LocalDateTime salesEnd,
        int sortOrder,
        List<Long> sessionIds,
        // --- 정원 연동 추가 필드 ---
        boolean isPurchasable,           // Computed: 실시간 구매 가능 여부
        String unavailableReason,        // 구매 불가 사유 (null이면 구매 가능)
        LocalDateTime recruitEndDate     // 연결된 세션들의 max(recruitEndDate)
) {
    /**
     * 기존 호환용: 세션 정보 없이 생성 (isPurchasable=false로 기본 처리)
     */
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getName(),
                ticket.getDescription(),
                ticket.getPrice(),
                ticket.getOriginalPrice(),
                ticket.getDiscountRate(),
                ticket.getIsAllSessions(),
                ticket.getMaxQuantity(),
                ticket.getSoldCount(),
                ticket.getRemainingQuantity(),
                ticket.isOnSale(),
                ticket.getIsActive(),
                ticket.getSalesStart(),
                ticket.getSalesEnd(),
                ticket.getSortOrder(),
                ticket.getSessionIds(),
                ticket.isOnSale() && ticket.getIsActive(),
                null,
                null
        );
    }

    /**
     * 정원 연동 포함: 연결된 세션 정보를 기반으로 isPurchasable, unavailableReason, recruitEndDate를 계산하여 생성
     */
    public static TicketResponse from(Ticket ticket, List<Session> linkedSessions) {
        String reason = computeUnavailableReason(ticket, linkedSessions);
        boolean purchasable = (reason == null);
        LocalDateTime maxRecruitEnd = computeMaxRecruitEndDate(linkedSessions);

        return new TicketResponse(
                ticket.getId(),
                ticket.getName(),
                ticket.getDescription(),
                ticket.getPrice(),
                ticket.getOriginalPrice(),
                ticket.getDiscountRate(),
                ticket.getIsAllSessions(),
                ticket.getMaxQuantity(),
                ticket.getSoldCount(),
                ticket.getRemainingQuantity(),
                ticket.isOnSale(),
                ticket.getIsActive(),
                ticket.getSalesStart(),
                ticket.getSalesEnd(),
                ticket.getSortOrder(),
                ticket.getSessionIds(),
                purchasable,
                reason,
                maxRecruitEnd
        );
    }

    /**
     * 마감 판단 우선순위에 따라 구매 불가 사유 계산
     * 1. 티켓 비활성 → "판매 종료된 티켓입니다"
     * 2. 티켓 재고 소진 → "매진되었습니다"
     * 3. 세션 정원 초과 → "세션 'OOO'의 정원이 마감되었습니다"
     * 4. 모집 기간 외 → PENDING: "아직 모집이 시작되지 않았습니다" / CLOSED: "모집이 마감되었습니다"
     * null이면 구매 가능
     */
    private static String computeUnavailableReason(Ticket ticket, List<Session> linkedSessions) {
        // 1. 티켓 비활성
        if (!ticket.getIsActive()) {
            return "판매 종료된 티켓입니다";
        }

        // 2. 티켓 재고 소진
        if (ticket.getMaxQuantity() != null && ticket.getRemainingQuantity() != null
                && ticket.getRemainingQuantity() <= 0) {
            return "매진되었습니다";
        }

        // 3. 연결된 세션 정원 초과
        for (Session session : linkedSessions) {
            if (session.getMaxAttendees() > 0
                    && session.getCurrentAttendees() >= session.getMaxAttendees()) {
                return "세션 '" + session.getTitle() + "'의 정원이 마감되었습니다";
            }
        }

        // 4. 모집 상태 검증
        for (Session session : linkedSessions) {
            RecruitmentStatus status = session.getRecruitmentStatus();
            if (status == RecruitmentStatus.PENDING) {
                return "아직 모집이 시작되지 않았습니다" +
                        (session.getRecruitStartDate() != null
                                ? " (시작: " + session.getRecruitStartDate().toLocalDate() + ")"
                                : "");
            }
            if (status == RecruitmentStatus.CLOSED) {
                return "모집이 마감되었습니다";
            }
        }

        return null; // 구매 가능
    }

    /**
     * 연결된 세션들의 최대 모집 마감일 계산
     */
    private static LocalDateTime computeMaxRecruitEndDate(List<Session> linkedSessions) {
        return linkedSessions.stream()
                .map(Session::getRecruitEndDate)
                .filter(d -> d != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
    }
}

