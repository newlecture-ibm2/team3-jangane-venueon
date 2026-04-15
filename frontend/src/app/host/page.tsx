'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface RecentOrder {
  orderId: number;
  eventTitle: string;
  amount: number;
  orderedAt: string;
  status: string;
}

interface HostOrderSummary {
  currentMonthRevenue: number;
  totalAttendees: number;
}

import { Table, TableHeader, TableRow, TableCell, StatusTag } from '@/components/ui';

export default function HostDashboardPage() {
  const [stats, setStats] = useState({
    publishedCount: 0,
    draftCount: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    pendingRefunds: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const publishedRes = await api.get<{ status: string; data: { totalElements: number } }>('/host/events?size=1');
        const draftRes = await api.get<{ status: string; data: { totalElements: number } }>('/host/events/drafts?size=1');
        const recentOrdersRes = await api.get<{ status: string; data: RecentOrder[] }>('/host/orders/recent?size=5');
        const orderSummaryRes = await api.get<{ status: string; data: HostOrderSummary }>('/host/orders/summary');

        setStats(prev => ({
          ...prev,
          publishedCount: publishedRes.data?.totalElements || 0,
          draftCount: draftRes.data?.totalElements || 0,
          totalRevenue: orderSummaryRes.data?.currentMonthRevenue || 0,
          totalAttendees: orderSummaryRes.data?.totalAttendees || 0,
        }));
        setRecentOrders(recentOrdersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }
    fetchDashboardStats();
  }, []);

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar-content">
        <div className={styles.dashboardWrapper}>

          <header className={styles.header}>
            <h1 className={styles.pageTitle}>호스트 대시보드</h1>
            <p className={styles.pageSubtitle}>환영합니다! 현재 개설하신 강의들의 현황을 한눈에 확인하세요.</p>
          </header>

          <section className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.revenueIcon}`}>💰</div>
              <p className={styles.cardTitle}>이번 달 누적 매출</p>
              <h2 className={styles.cardValue}>{stats.totalRevenue.toLocaleString()}원</h2>
            </div>

            <Link href="/host/events" className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.eventIcon}`}>📊</div>
              <p className={styles.cardTitle}>진행/게시 중인 이벤트</p>
              <h2 className={styles.cardValue}>{stats.publishedCount}개</h2>
            </Link>

            <Link href="/host/attendees" className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.userIcon}`}>👥</div>
              <p className={styles.cardTitle}>총 누적 수강생</p>
              <h2 className={styles.cardValue}>{stats.totalAttendees}명</h2>
            </Link>
          </section>

          <div className={styles.sectionsGrid}>
            <section className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>최근 주문 내역</h3>
                <Link href="/host/payments" className={styles.viewAllBtn}>전체 보기 &gt;</Link>
              </div>

              <div className={styles.tableContainer}>
                <Table columns="30px 90px 100px 80px 60px">
                  <TableHeader>
                    <TableCell header>#</TableCell>
                    <TableCell header>강의명</TableCell>
                    <TableCell header>주문금액</TableCell>
                    <TableCell header>주문일</TableCell>
                    <TableCell header>상태</TableCell>
                  </TableHeader>
                  {recentOrders.map(order => (
                    <TableRow key={order.orderId}>
                      <TableCell>#{order.orderId}</TableCell>
                      <TableCell>{order.eventTitle}</TableCell>
                      <TableCell>{order.amount.toLocaleString()}원</TableCell>
                      <TableCell>{order.orderedAt ? order.orderedAt.slice(0, 10) : '-'}</TableCell>
                      <TableCell>
                        <StatusTag domain="payment" status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>
                        주문 내역이 없습니다.
                      </div>
                    </TableRow>
                  )}
                </Table>
              </div>
            </section>

            <section className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>빠른 작업</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/host/events/new" className="button" style={{
                  background: '#1e293b', color: 'white', padding: '16px', borderRadius: '8px',
                  textAlign: 'center', textDecoration: 'none', fontWeight: '600'
                }}>
                  + 새로운 강의 개설하기
                </Link>
                <Link href="/host/events" className="button" style={{
                  background: '#f1f5f9', color: '#1e293b', padding: '16px', borderRadius: '8px',
                  textAlign: 'center', textDecoration: 'none', fontWeight: '600'
                }}>
                  내 강의 목록 관리
                </Link>
                <Link href="/host/contact" className="button" style={{
                  background: '#f1f5f9', color: '#1e293b', padding: '16px', borderRadius: '8px',
                  textAlign: 'center', textDecoration: 'none', fontWeight: '600'
                }}>
                  1:1 문의하기
                </Link>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
