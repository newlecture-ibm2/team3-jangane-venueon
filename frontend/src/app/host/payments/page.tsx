'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Table, TableHeader, TableRow, TableCell, StatusTag, Pagination } from '@/components/ui';
import styles from './page.module.css';

interface Order {
  orderId: number;
  userName: string;
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

export default function HostPaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');

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
      <Sidebar role="host" />
      <div className="sidebar-content">
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

            <Table columns="60px 80px minmax(0, 1fr) 100px 130px 80px">
              <TableHeader>
                <TableCell header>주문번호</TableCell>
                <TableCell header>주문자</TableCell>
                <TableCell header>강의명</TableCell>
                <TableCell header>주문금액</TableCell>
                <TableCell header>주문일시</TableCell>
                <TableCell header>상태</TableCell>
              </TableHeader>
              {loading ? (
                <TableRow>
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    로딩 중...
                  </div>
                </TableRow>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <TableRow key={order.orderId}>
                    <TableCell>
                      <span
                        className={styles.orderLink}
                        onClick={() => handleRowClick(order.orderId)}
                      >
                        #{order.orderId}
                      </span>
                    </TableCell>
                    <TableCell>{order.userName}</TableCell>
                    <TableCell>{order.eventTitle}</TableCell>
                    <TableCell>{order.amount.toLocaleString()}원</TableCell>
                    <TableCell>{order.orderedAt ? order.orderedAt.replace('T', ' ').slice(0, 16) : '-'}</TableCell>
                    <TableCell>
                      <StatusTag domain="payment" status={order.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    주문 내역이 없습니다.
                  </div>
                </TableRow>
              )}
            </Table>

            {!loading && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <Pagination
                  currentPage={page + 1}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p - 1)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
