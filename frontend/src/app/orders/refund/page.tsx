"use client";

import React, { useEffect, useState } from 'react';
import styles from './refund.module.css';

// 취소 사유 선택지
const CANCEL_REASONS = [
  '일정이 변경되어 참석이 어렵습니다.',
  '다른 강의를 수강하고 싶습니다.',
  '단순 변심입니다.',
  '강의 내용이 기대와 달랐습니다.',
  '직접 입력',
];

interface OrderItem {
  orderId: number;
  eventId: number;
  eventTitle: string;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  orderedAt: string;
  paidAt: string | null;
}

export default function RefundPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // 주문 목록 불러오기
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/me?page=0&size=50');
      if (!res.ok) throw new Error('주문 목록을 불러올 수 없습니다.');
      const json = await res.json();
      // Page 형태의 응답 파싱
      const content = json.data?.content || json.data || [];
      setOrders(Array.isArray(content) ? content : []);
    } catch (err) {
      console.error('주문 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 취소 요청 실행
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;

    const reason = selectedReason === '직접 입력' ? customReason : selectedReason;
    if (!reason.trim()) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${cancelTarget.orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || '환불 요청에 실패했습니다.');
      }

      // 성공: 로컬 목록에서 해당 주문의 상태를 즉시 REFUNDED로 갱신
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === cancelTarget.orderId ? { ...o, status: 'REFUNDED' } : o
        )
      );
      setCancelTarget(null);
      setSelectedReason('');
      setCustomReason('');
      setToast({ title: '환불 완료', message: `${cancelTarget.eventTitle} 수강이 취소되었습니다.` });
      setTimeout(() => setToast(null), 4000);

    } catch (err: any) {
      alert(err.message || '환불 처리 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

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
          수강 신청한 강의 목록입니다. 결제 완료 상태의 강의만 취소가 가능합니다.
        </p>
      </div>

      {/* 주문 목록 */}
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p>아직 수강 신청한 강의가 없습니다.</p>
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
                      setSelectedReason('');
                      setCustomReason('');
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
        <div className={styles.overlay} onClick={() => !cancelling && setCancelTarget(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.dialogTitle}>수강 취소</h2>
            <p className={styles.dialogSubtitle}>
              <strong>{cancelTarget.eventTitle}</strong>의 수강을 취소하시겠어요?<br />
              취소 사유를 선택해 주세요.
            </p>

            <div className={styles.reasonOptions}>
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`${styles.reasonOption} ${selectedReason === reason ? styles.reasonOptionSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    className={styles.reasonRadio}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {selectedReason === '직접 입력' && (
              <input
                type="text"
                className={styles.customReasonInput}
                placeholder="취소 사유를 직접 입력해 주세요"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancelBtn}
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
              >
                돌아가기
              </button>
              <button
                className={styles.dialogConfirmBtn}
                onClick={handleCancelConfirm}
                disabled={
                  cancelling ||
                  !selectedReason ||
                  (selectedReason === '직접 입력' && !customReason.trim())
                }
              >
                {cancelling ? '처리 중...' : '환불 요청'}
              </button>
            </div>
          </div>
        </div>
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
