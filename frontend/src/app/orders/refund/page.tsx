"use client";

import React from 'react';
import styles from './page.module.css';
import CancelDialog from './_components/CancelDialog';
import { useRefund } from './useRefund';

export default function RefundPage() {
  const {
    orders,
    loading,
    cancelling,
    cancelTarget,
    setCancelTarget,
    toast,
    handleCancelConfirm
  } = useRefund();

  // 가격 포맷
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  // 날짜 포맷
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 상태 뱃지 매핑
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return { label: '결제 완료', className: styles.statusPaid };
      case 'REFUNDED': return { label: '환불 완료', className: styles.statusRefunded };
      case 'PENDING': return { label: '결제 대기', className: styles.statusPending };
      case 'CANCELLED': return { label: '취소됨', className: styles.statusRefunded };
      case 'REGISTERED': return { label: '등록 완료', className: styles.statusPaid };
      default: return { label: status, className: '' };
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <p>주문 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 헤더 */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>내 수강 내역</h1>
        <p className={styles.subtitle}>
          수강 신청한 세션 목록입니다. 결제 완료 상태의 세션만 취소가 가능합니다.
        </p>
      </div>

      {/* 주문 목록 */}
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p>아직 수강 신청한 세션가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div key={order.orderId} className={styles.orderCard}>
                <div className={styles.orderInfo}>
                  <p className={styles.eventTitle}>{order.eventTitle}</p>
                  <p className={styles.orderMeta}>
                    <span>{formatPrice(order.amount)}</span>
                    <span>•</span>
                    <span>{formatDate(order.orderedAt)}</span>
                    <span className={`${styles.statusBadge} ${badge.className}`}>{badge.label}</span>
                  </p>
                </div>
                {order.status === 'PAID' && (
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setCancelTarget(order);
                    }}
                  >
                    수강 취소
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 취소 사유 다이얼로그 */}
      {cancelTarget && (
        <CancelDialog
          cancelTarget={cancelTarget}
          cancelling={cancelling}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>✅</div>
          <div className={styles.toastContent}>
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
