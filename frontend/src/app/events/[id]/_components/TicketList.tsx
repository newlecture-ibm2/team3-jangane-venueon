'use client';

import React, { useState } from 'react';
import { Button, Tag } from '@/components/ui';
import styles from './TicketList.module.css';
import { format, differenceInDays } from 'date-fns';

interface Ticket {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  isAllSessions: boolean;
  maxQuantity: number | null;
  soldCount: number;
  remainingQuantity: number | null;
  isOnSale: boolean;
  isActive: boolean;
  salesStart: string | null;
  salesEnd: string | null;
  sortOrder: number;
  sessionIds: number[];
  isPurchasable?: boolean;
  unavailableReason?: string | null;
  recruitEndDate?: string | null;
}

function getUrgencyLevel(endDateStr: string | null | undefined) {
  if (!endDateStr) return null;
  const daysLeft = differenceInDays(new Date(endDateStr), new Date());
  if (daysLeft >= 0 && daysLeft <= 3) return `마감 D-${daysLeft === 0 ? 'Day' : daysLeft}`;
  return null;
}

interface TicketListProps {
  tickets: Ticket[];
  sessions?: any[];
  eventStatus: string;
}

export default function TicketList({ tickets, sessions, eventStatus }: TicketListProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>등록된 티켓이 없습니다.</p>
      </div>
    );
  }

  const canPurchase = eventStatus === 'PUBLISHED' || eventStatus === 'ONGOING';

  return (
    <div className={styles.ticketListWrapper}>
      <div className={styles.ticketGrid}>
        {tickets.map((ticket) => {
          // 새로 추가된 isPurchasable 기반 판단 (v6 정원 연동) - 백엔드가 없거나 이전 버전이면 기존 로직으로 Fallback
          const isSoldOut = ticket.remainingQuantity !== null && ticket.remainingQuantity <= 0;
          const isSelectable = (ticket.isPurchasable ?? (ticket.isOnSale && !isSoldOut)) && canPurchase;
          const urgencyText = getUrgencyLevel(ticket.recruitEndDate);

          return (
            <div
              key={ticket.id}
              className={`${styles.ticketCard} ${selectedTicketId === ticket.id ? styles.selected : ''} ${!isSelectable ? styles.disabled : ''}`}
              onClick={() => isSelectable && setSelectedTicketId(ticket.id)}
            >
              {/* 상단 태그 영역 */}
              <div className={styles.ticketHeader}>
                <div className={styles.ticketTags}>
                  {ticket.isAllSessions && (
                    <Tag variant="purple">전체 세션</Tag>
                  )}
                  {!ticket.isAllSessions && (
                    <Tag variant="gray">개별 세션</Tag>
                  )}
                  {ticket.discountRate > 0 && (
                    <span className={styles.discountBadge}>{ticket.discountRate}% 할인</span>
                  )}
                  {isSelectable && urgencyText && (
                    <span className={styles.urgencyBadge}>{urgencyText}</span>
                  )}
                </div>
                { ticket.isPurchasable === false ? (
                  <Tag variant="red">선택 불가</Tag>
                ) : (
                  <Tag variant="green">선택 가능</Tag>
                )}
              </div>

              {/* 이름/설명/세션 - 상단 영역 */}
              <div className={styles.ticketContent}>
                <h4 className={styles.ticketName}>{ticket.name}</h4>

                {ticket.description && (
                  <p className={styles.ticketDesc}>{ticket.description}</p>
                )}
                
                {sessions && sessions.length > 0 && (
                  <div className={styles.ticketIncludedSessions}>
                    <strong>🎟️ {ticket.isAllSessions ? '이용 가능 세션' : '포함된 세션'}</strong><br />
                    {ticket.isAllSessions 
                      ? '이벤트의 모든 세션에 참여하실 수 있습니다.' 
                      : ticket.sessionIds && ticket.sessionIds.length > 0
                        ? sessions.filter(s => ticket.sessionIds.includes(s.id)).map(s => s.title).join(' • ')
                        : '선택된 세션 없음'
                    }
                  </div>
                )}
                
                {ticket.isPurchasable === false && ticket.unavailableReason && (
                  <div className={styles.unavailableReason}>
                    ⚠️ {ticket.unavailableReason}
                  </div>
                )}
              </div>

              {/* 가격/수량 - 하단 영역 */}
              <div className={styles.ticketFooter}>
                <div className={styles.priceArea}>
                  {ticket.originalPrice > 0 && ticket.discountRate > 0 && (
                    <span className={styles.originalPrice}>
                      ₩{ticket.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {ticket.price === 0 ? '무료' : `₩${ticket.price.toLocaleString()}`}
                  </span>
                </div>

                <div className={styles.stockInfo}>
                  {ticket.remainingQuantity !== null ? (
                    <span className={styles.stockText}>
                      잔여 <strong>{ticket.remainingQuantity}</strong>매
                    </span>
                  ) : (
                    <span className={styles.stockText}>수량 무제한</span>
                  )}

                  {ticket.recruitEndDate && (
                    <div className={styles.recruitEndText}>
                      마감: {format(new Date(ticket.recruitEndDate), 'MM.dd HH:mm')}
                    </div>
                  )}
                </div>
              </div>

              {/* 선택 표시 */}
              {isSelectable && (
                <div className={styles.selectIndicator}>
                  <div className={`${styles.radioCircle} ${selectedTicketId === ticket.id ? styles.radioActive : ''}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 액션 */}
      {canPurchase && selectedTicketId && (
        <div className={styles.actionArea}>
          <p className={styles.selectedInfo}>
            선택된 티켓: <strong>{tickets.find(t => t.id === selectedTicketId)?.name}</strong>
          </p>
          {/* TODO: Order/Cart 연동 시 실제 주문 페이지 이동 구현 */}
          <Button variant="primary" size="large" disabled>
            수강 신청 (추후 연동 예정)
          </Button>
        </div>
      )}
    </div>
  );
}
