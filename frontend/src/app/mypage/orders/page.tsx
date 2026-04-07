'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Button, Tag, Pagination } from '@/components/ui';
import RefundModal from './components/RefundModal';
import mypageStyles from '../page.module.css'; // 공통 컨텐츠 래퍼
import styles from './page.module.css';
import { useUIStore } from '@/store/useUIStore';

// 백엔드 API 응답 타입 (OrderController.OrderDetailResponse)
interface OrderDetailResponse {
  orderId: number;
  eventId: number;
  eventTitle: string;
  status: string; // PENDING, PAID, REGISTERED, CANCELLED, REFUNDED 등
  quantity: number;
  amount: number;
  paymentMethod: string;
  orderedAt: string;
  paidAt: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<OrderDetailResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refundOrder, setRefundOrder] = useState<{ isOpen: boolean; orderId: number | null }>({
    isOpen: false,
    orderId: null
  });

  // 백엔드 연동 (GET /orders/me) - 우선 기본으로 호출
  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    try {
      // TODO: 백엔드 컨트롤러가 JWT를 읽도록 수정되면 ?userId 파라미터 제외 가능
      const res = await fetch(`/api/orders/me?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data && data.content) {
          setOrders(data.content);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // ex) 2026-04-07T12:00:00 -> 2026.04.07 12:00
    const d = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 상태별 색상 매핑
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'REGISTERED':
        return <Tag variant="green">결제 완료</Tag>;
      case 'REFUND_REQUESTED':
        return <Tag variant="purple">환불 대기</Tag>;
      case 'REFUNDED':
        return <Tag variant="gray">환불 완료</Tag>;
      case 'CANCELLED':
        return <Tag variant="gray">취소됨</Tag>;
      case 'PENDING':
      default:
        return <Tag variant="gray">결제 대기</Tag>;
    }
  };

  const submitRefund = async (reason: string) => {
    if (!refundOrder.orderId) return;

    try {
      const res = await fetch(`/api/orders/${refundOrder.orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        showToast('환불 제출 완료', 'success', '환불 신청이 완료되었습니다.');
        setRefundOrder({ isOpen: false, orderId: null });
        fetchOrders(currentPage);
      } else {
        const errorData = await res.json();
        showToast('환불 신청 실패', 'error', errorData.message || '환불 신청 중 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('서버와의 통신에 실패했습니다.');
    }
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={mypageStyles.content}>
          <h1 className={mypageStyles.pageTitle}>결제 내역</h1>

          <div className={styles.listContainer}>
            {!loading && orders.length === 0 ? (
              <div className={styles.emptyState}>결제하신 내역이 없습니다.</div>
            ) : (
              orders.map((order) => (
                <div key={order.orderId} className={styles.orderItem}>
                  {/* 왼쪽 위: 태그 + 결제 일시 */}
                  <div className={styles.topRow}>
                    {getStatusTag(order.status)}
                    <span className={styles.dateText}>결제 일시: {formatDate(order.paidAt || order.orderedAt)}</span>
                  </div>

                  {/* 중간: 행사/강의명 + 금액 */}
                  <div className={styles.middleRow}>
                    <h3 className={styles.orderTitle}>{order.eventTitle}</h3>
                    <div className={styles.priceText}>
                      총 결제 금액: {formatCurrency(order.amount)} (수량 {order.quantity}개)
                    </div>
                  </div>

                  {/* 오른쪽 아래: 액션 버튼 그룹 */}
                  <div className={styles.actionRow}>
                    {(order.status === 'PAID' || order.status === 'REGISTERED') && (
                      <Button
                        variant="danger"
                        onClick={() => setRefundOrder({ isOpen: true, orderId: order.orderId })}
                      >
                        환불 신청
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/mypage/orders/${order.orderId}`)}
                    >
                      상세 보기
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <RefundModal 
        isOpen={refundOrder.isOpen}
        onClose={() => setRefundOrder({ isOpen: false, orderId: null })}
        onConfirm={submitRefund}
      />
    </div>
  );
}
