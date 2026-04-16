'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Button, StatusTag, Toast } from '@/components/ui';
import RefundModal from '../components/RefundModal';
import mypageStyles from '../../page.module.css';
import styles from './page.module.css';
import { useUIStore } from '@/store/useUIStore';

// 백엔드 API 응답 타입 (OrderController.OrderDetailResponse)
interface OrderDetailResponse {
  orderId: number;
  eventId: number;
  eventTitle: string;
  ticketName: string;
  ticketPrice: number;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  orderedAt: string;
  paidAt: string | null;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useUIStore();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
      } else {
        showToast('오류', 'error', '결제 상세 내역을 불러오는데 실패했습니다.');
        router.push('/mypage/orders');
      }
    } catch (err) {
      console.error(err);
      showToast('오류', 'error', '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const submitRefund = async (reason: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        showToast('환불 제출 완료', 'success', '환불 신청이 완료되었습니다.');
        setIsRefundModalOpen(false);
        fetchOrderDetail(); // 데이터 리프레시
      } else {
        const errorData = await res.json();
        showToast('환불 신청 실패', 'error', errorData.message || '환불 신청 중 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
      showToast('통신 오류', 'error', '서버와의 통신에 실패했습니다.');
    }
  };

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

  // getStatusTag는 공통 StatusTag를 사용하므로 제거

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

            {/* 3. 결제 정보 섹션 */}
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
