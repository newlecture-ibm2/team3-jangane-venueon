'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Button, Tag } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import styles from './TicketList.module.css';
import { format, differenceInDays } from 'date-fns';
import { useTicketCart } from './useTicketCart';

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
  eventStatusId: number;
}

export default function TicketList({ tickets, sessions, eventStatusId }: TicketListProps) {
  const params = useParams();
  const eventId = Number(params?.id);
  
  const {
    selectedTicketId,
    setSelectedTicketId,
    addingToCart,
    setAddingToCart,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal,
    showErrorModal,
    setShowErrorModal,
    proceedAddToCart,
    handleAddToCartClick,
    router
  } = useTicketCart(eventId);

  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>등록된 티켓이 없습니다.</p>
      </div>
    );
  }

  const canPurchase = eventStatusId === 2 || eventStatusId === 3;

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
                {ticket.isPurchasable === false ? (
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
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              disabled={addingToCart}
              onClick={handleAddToCartClick}
            >
              {addingToCart ? '추가 중...' : '장바구니 담기'}
            </Button>
            <Button
              variant="primary"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                const params = new URLSearchParams();
                params.set('ticketId', String(selectedTicketId));
                params.set('quantity', '1');
                router.push(`/orders/checkout?${params.toString()}`);
              }}
            >
              바로 구매
            </Button>
          </div>
        </div>
      )}

      {/* 동일 이벤트 티켓 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setAddingToCart(false);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          proceedAddToCart();
        }}
        title="같은 세미나의 티켓을 이미 장바구니에 담으셨습니다."
        subtitle="그래도 새로운 티켓을 구매하시겠습니까?"
        confirmText="예"
        cancelText="아니오"
      />

      {/* 이미 담겨있는 티켓 에러 모달 */}
      <ConfirmModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setAddingToCart(false);
        }}
        onConfirm={() => {
          setShowErrorModal(false);
          setAddingToCart(false);
        }}
        title="티켓 추가 불가"
        subtitle="이미 장바구니에 담겨 있는 티켓입니다."
        confirmText="확인"
        hideCancel={true}
      />

      {/* 장바구니 추가 성공 모달 */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => router.push('/cart')}
        title="장바구니 추가 완료"
        subtitle="티켓이 장바구니에 추가되었습니다."
        confirmText="장바구니로 이동"
        cancelText="계속 쇼핑하기"
      />
    </div>
  );
}
