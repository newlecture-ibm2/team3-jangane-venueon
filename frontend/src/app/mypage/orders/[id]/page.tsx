'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Button, StatusTag } from '@/components/ui';
import RefundModal from '../components/RefundModal';
import mypageStyles from '../../page.module.css';
import styles from './page.module.css';
import { useOrderDetail } from './useOrderDetail';
import { OnlineSessionCard } from './_components/OnlineSessionCard';

export default function OrderDetailPage() {
  const {
    order,
    loading,
    isRefundModalOpen,
    setIsRefundModalOpen,
    submitRefund,
    router
  } = useOrderDetail();

  if (loading) {
    return (
      <div className="container-sidebar">
        <Sidebar role="user" />
        <div className="sidebar-content"><p>로딩 중...</p></div>
      </div>
    );
  }

  if (!order) return null;

  const formatCurrency = (amount: number) => `₩${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const canRefund = order.status === 'PAID' || order.status === 'REGISTERED';

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={mypageStyles.content}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <h1 className={mypageStyles.pageTitle}>결제 상세 내역</h1>
            <StatusTag domain="payment" status={order.status} />
          </div>

          <div className={styles.detailContainer}>
            {/* 1. 주문 정보 섹션 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>주문 정보</h2>
              <div className={styles.row}>
                <span className={styles.label}>주문 번호</span>
                <span className={styles.value}>{order.orderId}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>주문 일시</span>
                <span className={styles.value}>{formatDate(order.orderedAt)}</span>
              </div>
            </div>

            {/* 2. 상품 정보 섹션 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>상품 정보</h2>
              <div className={styles.row}>
                <span className={styles.label}>행사명</span>
                <span className={styles.value}>{order.eventTitle}</span>
              </div>
              {order.ticketName && (
                <div className={styles.row}>
                  <span className={styles.label}>티켓</span>
                  <span className={styles.value}>{order.ticketName}</span>
                </div>
              )}
              <div className={styles.row}>
                <span className={styles.label}>참가 인원(수량)</span>
                <span className={styles.value}>{order.quantity}명</span>
              </div>
            </div>

            {/* 3. 온라인 세션 정보 섹션 (조건부 노출) */}
            {order.onlineSessions && order.onlineSessions.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>온라인 세션 입장</h2>
                {order.onlineSessions.map(session => (
                  <OnlineSessionCard key={session.sessionId} session={session} />
                ))}
              </div>
            )}

            {/* 4. 결제 정보 섹션 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>결제 정보</h2>
              <div className={styles.row}>
                <span className={styles.label}>결제 수단</span>
                <span className={styles.value}>{order.paymentMethod}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>결제 일시</span>
                <span className={styles.value}>{formatDate(order.paidAt || '')}</span>
              </div>
              <div className={`${styles.row} ${styles.totalRow}`}>
                <span className={styles.label}>총 결제 금액</span>
                <span className={styles.totalValue}>{formatCurrency(order.amount)}</span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className={styles.actionArea}>
              <Button variant="primary" onClick={() => router.push('/mypage/orders')}>
                목록으로
              </Button>
              {canRefund && (
                <Button variant="danger" onClick={() => setIsRefundModalOpen(true)}>
                  환불 신청
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onConfirm={submitRefund}
      />
    </div>
  );
}
