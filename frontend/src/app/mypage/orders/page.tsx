'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Button, Tag, Pagination, Table, TableHeader, TableRow, TableCell, StatusTag } from '@/components/ui';
import mypageStyles from '../page.module.css'; // 공통 컨텐츠 래퍼
import styles from './page.module.css';
import { useUIStore } from '@/store/useUIStore';

// 백엔드 API 응답 타입 (OrderCont// 백엔드 API 응답 타입 (OrderController.OrderSummaryResponse)
interface OrderSummaryResponse {
  orderId: number;
  tossOrderId: string;
  orderName: string; // "이벤트 A 외 N건"
  totalAmount: number;
  totalQuantity: number;
  status: string; // PENDING, PAID, REGISTERED, CANCELLED, REFUNDED 등
  orderedAt: string;
  paidAt: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 백엔드 연동 (GET /orders/me) - 우선 기본으로 호출
  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    try {
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: '-', time: '' };
    const d = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      date: `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
    };
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
              <Table columns="1fr 100px 140px 100px 100px">
                <TableHeader>
                  <TableCell header>상세 내역</TableCell>
                  <TableCell header>결제 일시</TableCell>
                  <TableCell header>결제 금액</TableCell>
                  <TableCell header>상태</TableCell>
                  <TableCell header></TableCell>
                </TableHeader>
                {orders.map((order) => {
                  const dt = formatDateTime(order.paidAt || order.orderedAt);
                  return (
                    <TableRow key={order.orderId}>
                      <TableCell>
                        <div className={styles.orderNameInfo}>
                          <span className={styles.orderName}>{order.orderName}</span>
                          {order.totalQuantity > 1 && (
                            <span className={styles.quantityInfo}>총 {order.totalQuantity}개 항목</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={styles.dateText}>{dt.date}</span>
                          <span className={styles.dateText}>{dt.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusTag domain="payment" status={order.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="primary"
                          onClick={() => router.push(`/mypage/orders/${order.orderId}`)}
                        >
                          상세 보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
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

    </div>
  );
}
