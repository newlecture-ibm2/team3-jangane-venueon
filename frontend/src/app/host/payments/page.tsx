'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';

interface Order {
  orderId: number;
  userName: string; // 추가: 주문자 이름
  eventTitle: string;
  amount: number;
  orderedAt: string;
  status: string;
}

interface HostEvent {
  id: number;
  title: string;
}

interface PageData {
  content: Order[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

function getOrderStatusLabel(status: string) {
  switch (status) {
    case 'PAID':
      return '결제완료';
    case 'REGISTERED':
      return '신청완료';
    case 'CANCELLED':
      return '주문취소';
    case 'REFUNDED':
      return '환불완료';
    case 'PENDING':
      return '결제대기';
    default:
      return status;
  }
}

function getOrderStatusClass(status: string) {
  switch (status) {
    case 'PAID':
      return styles.orderStatusPaid;
    case 'REGISTERED':
      return styles.orderStatusRegistered;
    case 'CANCELLED':
      return styles.orderStatusCancelled;
    case 'REFUNDED':
      return styles.orderStatusRefunded;
    case 'PENDING':
      return styles.orderStatusPending;
    default:
      return styles.orderStatusDefault;
  }
}

function formatOrderDate(isoDateTime: string) {
  if (!isoDateTime) return '-';
  return isoDateTime.replace('T', ' ').slice(0, 16);
}

export default function HostPaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<HostEvent[]>([]); // 추가: 강의 목록
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState(''); // 추가: 강의 필터

  const handleRowClick = (orderId: number) => {
    router.push(`/host/payments/${orderId}`);
  };

  // 강의 목록 조회
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await api.get<{ status: string; data: { content: HostEvent[] } }>('/host/events?size=100');
        if (response.data && response.data.content) {
          setEvents(response.data.content);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const url = `/host/orders?page=${page}&size=10${statusFilter ? `&status=${statusFilter}` : ''}${eventFilter ? `&eventId=${eventFilter}` : ''}`;
        const response = await api.get<{ status: string; data: PageData }>(url);
        
        if (response.data) {
          setOrders(response.data.content);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [page, statusFilter, eventFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEventFilter(e.target.value);
    setPage(0);
  };

  return (
    <div className="container-sidebar">
      <div className="sidebar">
        <Sidebar role="host" />
      </div>

      <div className="main-content">
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.pageTitle}>전체 주문 내역</h1>
            <p className={styles.pageSubtitle}>모든 강의의 결제 및 신청 현황을 관리할 수 있습니다.</p>
          </header>

          <div className={styles.contentBox}>
            <div className={styles.filterBar}>
              <select 
                className={styles.selectBox} 
                value={eventFilter} 
                onChange={handleEventChange}
                style={{ marginRight: '12px' }}
              >
                <option value="">모든 강의</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              <select 
                className={styles.selectBox} 
                value={statusFilter} 
                onChange={handleStatusChange}
              >
                <option value="">전체 상태</option>
                <option value="PAID">결제완료</option>
                <option value="REGISTERED">신청완료</option>
                <option value="CANCELLED">주문취소</option>
                <option value="REFUNDED">환불완료</option>
                <option value="PENDING">결제대기</option>
              </select>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>주문자</th>
                    <th>강의명</th>
                    <th>주문금액</th>
                    <th>주문일시</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</td>
                    </tr>
                  ) : orders.length > 0 ? (
                    orders.map(order => (
                      <tr 
                        key={order.orderId} 
                        className={styles.tableRow}
                        onClick={() => handleRowClick(order.orderId)}
                      >
                        <td>
                          <span className={styles.orderLink}>
                            #{order.orderId}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{order.userName}</td>
                        <td>{order.eventTitle}</td>
                        <td>{order.amount.toLocaleString()}원</td>
                        <td>{formatOrderDate(order.orderedAt)}</td>
                        <td>
                          <span className={`${styles.orderStatus} ${getOrderStatusClass(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        주문 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 0 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn} 
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  이전
                </button>
                
                <span className={styles.pageInfo}>
                  {page + 1} / {totalPages} 페이지
                </span>

                <button 
                  className={styles.pageBtn} 
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
